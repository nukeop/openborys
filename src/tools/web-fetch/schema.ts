import { z } from 'zod';

export const webFetchInputSchema = z.object({
  url: z.url().describe('The URL of the website to fetch'),
  format: z
    .enum(['markdown', 'text'])
    .optional()
    .default('markdown')
    .describe('Content format you want to see'),
});
