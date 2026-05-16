import { tool } from 'ai';
import type { ToolWithMeta } from '../../services/tools';
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
    description: '',
    inputSchema: imageInputSchema,
  }),
};
