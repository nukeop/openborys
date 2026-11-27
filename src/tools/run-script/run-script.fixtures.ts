import { setSystemTime } from 'bun:test';
import { tool } from 'ai';
import { z } from 'zod';
import type { ToolWithMeta } from '../../services/tools';

export const repeat: ToolWithMeta<{ text: string; times: number }, string> = {
  id: 'repeat',
  name: 'Repeat',
  emoji: '🔁',
  isAlwaysAvailable: true,
  formatArgs: ({ text }) => text,
  tool: tool({
    description: 'Repeats text',
    inputSchema: z.object({ text: z.string(), times: z.number().default(3) }),
  }),
  execute: async ({ text, times }) => {
    setSystemTime(Date.now() + 1500);
    return text.repeat(times);
  },
};

export const broken: ToolWithMeta<Record<string, never>, string> = {
  id: 'broken',
  name: 'Broken',
  emoji: '💥',
  isAlwaysAvailable: true,
  formatArgs: () => '',
  tool: tool({ description: 'Always fails', inputSchema: z.object({}) }),
  execute: async () => {
    throw new Error('Tool broke');
  },
};
