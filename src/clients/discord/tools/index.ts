import type { Message } from 'discord.js';
import { ScopedToolService } from '../../../services/scoped-tools';
import { ToolService } from '../../../services/tools';
import { createDiscordApiTool } from '../../../tools/discord-api';
import { createDiscordImageTool } from '../../../tools/discord-image';
import { createDiscordVideoTool } from '../../../tools/discord-video';
import { createPhoneTool } from '../../../tools/phone';
import { createRunScriptTool } from '../../../tools/run-script';

// These tools live for the duration of handling one message
export const registerDiscordTools = (message: Message) => {
  ScopedToolService.registerTool(createDiscordApiTool(message), message.id);
  ScopedToolService.registerTool(createDiscordImageTool(message), message.id);
  ScopedToolService.registerTool(createDiscordVideoTool(message), message.id);
  ScopedToolService.registerTool(createPhoneTool(message), message.id);
  ScopedToolService.instantiateFactories('discord', message, message.id);

  // Scoped ids end with the message id; scripts get ids that stay the same across messages.
  const catalog = [
    ...ToolService.getAlwaysAvailableTools(),
    ...ScopedToolService.getToolsForScope(message.id),
  ].map((tool) => ({ ...tool, id: tool.id.replace(`_${message.id}`, '') }));
  ScopedToolService.registerTool(
    createRunScriptTool(message, catalog),
    message.id,
  );
};
