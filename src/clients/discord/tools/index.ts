import type { Message } from 'discord.js';
import { ScopedToolService } from '../../../services/scoped-tools';
import { createDiscordImageTool } from '../../../tools/discord-image';

// These tools live for the duration of handling one message
export const registerDiscordTools = (message: Message) => {
  ScopedToolService.registerTool(createDiscordImageTool(message), message.id);
};
