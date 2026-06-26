import { getLogger } from '@logtape/logtape';
import { tool } from 'ai';
import * as discord from 'discord.js';
import type { Message } from 'discord.js';
import { StringsService } from '../../services/strings';
import type { ToolWithMeta } from '../../services/tools';
import { errorMessage } from '../../utils/error';
import { createDiscordApiInputSchema } from './schema';

const logger = getLogger(['OpenBorys', 'tools', 'discord-api']);
const transpiler = new Bun.Transpiler({ loader: 'ts' });

export const DISCORD_API_TOOL_ID = 'discord__api';

type DiscordApiStrings = {
  toolName: string;
  toolDescription: string;
  codeDescription: string;
};

type DiscordApiInput = {
  code: string;
};

export const createDiscordApiTool: (
  message: Message,
) => ToolWithMeta<DiscordApiInput, string> = (message) => {
  const strings = StringsService.get('discord-api') as DiscordApiStrings;

  return {
    id: `${DISCORD_API_TOOL_ID}_${message.id}`,
    name: strings.toolName,
    emoji: '⚙️',
    isAlwaysAvailable: true,
    formatArgs: (args) => args.code.slice(0, 100),
    tool: tool({
      description: strings.toolDescription,
      inputSchema: createDiscordApiInputSchema(strings.codeDescription),
    }),
    execute: async ({ code }) => {
      logger.info('Executing Discord API code: {code}', { code });

      try {
        const jsCode = transpiler.transformSync(code);

        const fn = new Function(
          'client',
          'channelId',
          'message',
          'guild',
          'discord',
          `return (async () => { ${jsCode} })()`,
        );

        const result: unknown = await fn(
          message.client,
          message.channelId,
          message,
          message.guild,
          discord,
        );

        return JSON.stringify(result, null, 2);
      } catch (error) {
        logger.error('Discord API tool error: {error}', {
          error: errorMessage(error),
        });
        return `Discord API error: ${errorMessage(error)}`;
      }
    },
  };
};
