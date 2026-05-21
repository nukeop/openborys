import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { getLogger } from '@logtape/logtape';
import { S3Client } from 'bun';
import { DiscordCommandsService } from '../clients/discord/services/discord-commands';
import { env } from '../environment';
import { FriendsService } from '../friends';
import { EmbeddingsService } from '../services/embeddings';
import { RedisService } from '../services/redis';
import { ScopedToolService } from '../services/scoped-tools';
import { StringsService } from '../services/strings';
import { ToolService } from '../services/tools';
import { errorDetail } from '../utils/error';
import type { PluginContext, PluginFactory } from './types';

const logger = getLogger(['OpenBorys', 'plugins']);

async function fetchPluginSources(
  s3: S3Client,
  prefix: string,
): Promise<{ key: string; source: string }[]> {
  const list = await s3.list({ prefix });

  return Promise.all(
    list.contents!.map(async (obj) => ({
      key: obj.key,
      source: await s3.file(obj.key).text(),
    })),
  );
}

async function importFactory(
  key: string,
  source: string,
): Promise<PluginFactory> {
  const tmpPath = join(
    tmpdir(),
    `openborys-plugin-${Date.now()}-${key.replace(/\//g, '_')}`,
  );
  await Bun.write(tmpPath, source);

  try {
    const mod = await import(tmpPath);
    const factory = mod.default;

    if (typeof factory !== 'function') {
      throw new Error(`Plugin ${key} does not export a default function`);
    }

    return factory as PluginFactory;
  } finally {
    if (await Bun.file(tmpPath).exists()) {
      await Bun.file(tmpPath).delete();
    }
  }
}

export async function loadPlugins(): Promise<void> {
  const {
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_ENDPOINT_URL_S3,
    AWS_REGION,
    AWS_BUCKET,
    PLUGINS_PREFIX,
  } = env();

  const s3 = new S3Client({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    endpoint: AWS_ENDPOINT_URL_S3,
    region: AWS_REGION,
    bucket: AWS_BUCKET,
  });

  logger.info('Loading plugins from {prefix}...', { prefix: PLUGINS_PREFIX });
  const sources = await fetchPluginSources(s3, PLUGINS_PREFIX);

  const results = await Promise.allSettled(
    sources.map(async ({ key, source }) => {
      const factory = await importFactory(key, source);
      const context: PluginContext = {
        env: env(),
        logger: getLogger(['OpenBorys', 'plugins', key]),
        toolService: ToolService,
        scopedToolService: ScopedToolService,
        commandService: DiscordCommandsService,
        redis: RedisService.client(),
        friends: FriendsService,
        strings: StringsService,
        embeddings: EmbeddingsService,
      };

      await factory(context);

      logger.info('Loaded plugin from {key}', { key });
    }),
  );

  const loaded = results.filter(
    (result) => result.status === 'fulfilled',
  ).length;
  const failed = results.filter((result) => result.status === 'rejected');

  failed.forEach((failure) => {
    if (failure.status === 'rejected') {
      logger.error('Failed to load plugin: {message}', {
        message: errorDetail(failure.reason),
      });
    }
  });

  logger.info('Plugins loaded: {loaded}/{total}', {
    loaded,
    total: sources.length,
  });
}
