import { getLogger } from '@logtape/logtape';
import { S3Client } from 'bun';
import { env } from '../../environment';
import * as defaults from './defaults';

const logger = getLogger(['OpenBorys', 'services', 'strings']);

export class StringsService {
  static #strings: Record<string, Record<string, string>>;

  private constructor() {}

  static get(namespace: string): Record<string, string> {
    const result = StringsService.#strings[namespace];
    if (!result) {
      throw new Error(`No strings found for namespace "${namespace}"`);
    }

    return result;
  }

  static async loadStrings() {
    logger.info('Loading string overrides from block storage...');
    const {
      AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY,
      AWS_ENDPOINT_URL_S3,
      AWS_REGION,
      AWS_BUCKET,
      TOOL_STRINGS_PREFIX,
    } = env();
    const s3 = new S3Client({
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
      endpoint: AWS_ENDPOINT_URL_S3,
      region: AWS_REGION,
      bucket: AWS_BUCKET,
    });

    const list = await s3.list({ prefix: TOOL_STRINGS_PREFIX });

    const overrides: Record<string, Record<string, string>> = {};

    await Promise.all(
      (list.contents ?? []).map(async (obj) => {
        const key = obj.key;
        const filename = key.slice(TOOL_STRINGS_PREFIX.length);
        const id = filename.replace(/\.json$/, '');
        overrides[id] = (await s3.file(key).json()) as Record<string, string>;
      }),
    );

    const merged: Record<string, Record<string, string>> = { ...defaults };
    for (const [id, strings] of Object.entries(overrides)) {
      merged[id] = { ...(merged[id] ?? {}), ...strings };
    }

    logger.info('Loaded strings for {count} namespaces', {
      count: Object.keys(merged).length,
    });
    StringsService.#strings = merged;
  }
}
