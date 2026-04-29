import { tool } from 'ai';
import { EmbeddingsService } from '../../services/embeddings';
import type { ToolWithMeta } from '../../services/tools';
import { rememberInputSchema } from './schema';
import type { RememberInput } from './types';

export const rememberTool: ToolWithMeta<RememberInput, string> = {
  id: 'base__remember',
  name: 'Remember',
  emoji: '🧠',
  isAlwaysAvailable: true,
  formatArgs: (args) => args.content,
  execute: async ({ content }) => {
    EmbeddingsService.saveEmbedding(content);
    return `Remembered successfully`;
  },
  tool: tool({
    description:
      "Remember something permanently. Use this tool every time you encounter any information you want to remember permanently. You don't need to ask for permission to use this tool - do it as often as you need. Remember information that will be useful in the future, facts about the users, what happened today, or what adventures you had. When remembering, add the current date (with year) to the beginning of the content.",
    inputSchema: rememberInputSchema,
  }),
};
