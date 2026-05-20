import type { Logger } from '@logtape/logtape';
import type { RedisClient } from 'bun';
import type { DiscordCommandsService } from '../clients/discord/services/discord-commands';
import type { Environment } from '../environment';
import type { ToolService } from '../services/tools';

export type PluginContext = {
  env: Environment;
  logger: Logger;
  toolService: typeof ToolService;
  commandService: typeof DiscordCommandsService;
  redis: RedisClient;
};

export type PluginFactory = (context: PluginContext) => void | Promise<void>;
