import { z } from 'zod';

export const webSearchInputSchema = z.object({
  query: z.string().describe('The search query'),
  topic: z
    .enum(['general', 'news', 'finance'])
    .optional()
    .default('general')
    .describe('Category of search'),
  max_results: z
    .number()
    .min(1)
    .max(20)
    .optional()
    .default(5)
    .describe('Number of results to return'),
  include_answer: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether to include an LLM-generated answer summary'),
});
