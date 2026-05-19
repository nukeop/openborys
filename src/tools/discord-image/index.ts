import { getLogger } from '@logtape/logtape';
import { tool } from 'ai';
import type { Message } from 'discord.js';
import Replicate from 'replicate';
import { env } from '../../environment';
import type { ToolWithMeta } from '../../services/tools';
import { modelOptionsDescription } from './config';
import { imageInputSchema } from './schema';
import type { ImageInput } from './types';

const logger = getLogger(['OpenBorys', 'tools', 'discord-image']);

const replicate = new Replicate({
  auth: env().REPLICATE_API_TOKEN,
  fileEncodingStrategy: 'upload',
});

export const DISCORD_IMAGE_TOOL_ID = 'discord__image';

export const createDiscordImageTool: (
  message: Message,
) => ToolWithMeta<ImageInput, string> = (message) => ({
  id: `${DISCORD_IMAGE_TOOL_ID}_${message.id}`,
  name: 'Image',
  emoji: '🖍️',
  isAlwaysAvailable: true,
  formatArgs: (args) => args.prompt,
  tool: tool({
    description: [
      'Generate or edit images.',
      'Use mode "generate" to create a new image from a prompt, or "edit" to modify existing images (pass their attachment IDs in imageIds).',
      'Pass model-specific parameters in the options field.',
      '',
      'Available options per model:',
      modelOptionsDescription,
    ].join('\n'),
    inputSchema: imageInputSchema,
  }),
  execute: async ({ mode, imageIds, prompt, options }) => {
    logger.info(
      'Using Discord Image tool with mode: {mode}. Attached image ids: {imageIds}. Prompt: {prompt}',
      { mode, imageIds, prompt, options },
    );
    return 'Test';
  },
});
