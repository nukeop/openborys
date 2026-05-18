import type { Message } from 'discord.js';
import { ToolService } from '../../../services/tools';
import {
  createDiscordImageTool,
  DISCORD_IMAGE_TOOL_ID,
} from '../../../tools/discord-image';

// These tools live for the duration of handling one message
export const registerDiscordTools = (message: Message) => {
  ToolService.registerTool(createDiscordImageTool(message));
};

export const unregisterDiscordTools = (message: Message) => {
  ToolService.unregisterTool(DISCORD_IMAGE_TOOL_ID + message.id);
};
