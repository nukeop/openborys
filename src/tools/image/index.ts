import { tool } from 'ai';
import type { ToolWithMeta } from '../../services/tools';
import { modelOptionsDescription } from './config';
import { imageInputSchema } from './schema';
import type { ImageInput } from './types';

export const imageTool: ToolWithMeta<ImageInput, string> = {
  id: 'base__image',
  name: 'Image',
  emoji: '🖍️',
  isAlwaysAvailable: true,
  formatArgs: () => '',
  execute: async () => {
    return '';
  },
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
};
