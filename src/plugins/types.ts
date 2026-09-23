import type { Logger } from '@logtape/logtape';
import type { DiscordCommandsService } from '../clients/discord/services/discord-commands';
import type { Environment } from '../environment';
import type { FriendsService } from '../friends';
import type { ai } from '../services/ai';
import type { EmbeddingsService } from '../services/embeddings';
import type { RedisService } from '../services/redis';
import type { ScopedToolService } from '../services/scoped-tools';
import type { StringsService } from '../services/strings';
import type { ToolService } from '../services/tools';

export type PluginContext = {
  env: Environment;
  logger: Logger;
  toolService: typeof ToolService;
  scopedToolService: typeof ScopedToolService;
  commandService: typeof DiscordCommandsService;
  redis: typeof RedisService.execute;
  friends: typeof FriendsService;
  embeddings: typeof EmbeddingsService;
  strings: typeof StringsService;
  ai: typeof ai;
};

export type PluginFactory = (context: PluginContext) => void | Promise<void>;
