import { tool } from 'ai';
import { EmbeddingsService } from '../../services/embeddings';
import type { ToolWithMeta } from '../../services/tools';
import { recallInputSchema } from './schema';
import type { RecallInput } from './types';

export const recallTool: ToolWithMeta<RecallInput, string> = {
  id: 'base__recall',
  name: 'Recall',
  emoji: '💭',
  isAlwaysAvailable: true,
  formatArgs: (args) => args.query,
  execute: async ({ query, limit }) => {
    const memories = await EmbeddingsService.search(query, limit);

    if (memories.length === 0) {
      return 'No memories found for that query.';
    }

    return memories.map((memory, i) => `${i + 1}. ${memory}`).join('\n');
  },
  tool: tool({
    description:
      'Recall memories you saved earlier using the remember tool. Use this tool on your own initiative, without asking users for permission. You can try to recall anything, and the result will be a list of the most semantically similar memories you saved in the past. You can use dates as keywords. Use recall whenever you feel you are missing some information or context.',
    inputSchema: recallInputSchema,
  }),
};
