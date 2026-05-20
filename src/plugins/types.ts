import type { Logger } from '@logtape/logtape';
import type { RedisClient } from 'bun';
import type { DiscordCommandsService } from '../clients/discord/services/discord-commands';
import type { Environment } from '../environment';
import type { FriendsService } from '../friends';
import type { EmbeddingsService } from '../services/embeddings';
import type { ToolService } from '../services/tools';

export type PluginContext = {
  env: Environment;
  logger: Logger;
  toolService: typeof ToolService;
  commandService: typeof DiscordCommandsService;
  redis: RedisClient;
  friends: typeof FriendsService;
  embeddings: typeof EmbeddingsService;
};

export type PluginFactory = (context: PluginContext) => void | Promise<void>;
