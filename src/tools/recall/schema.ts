import z from 'zod';

export const recallInputSchema = z.object({
  query: z
    .string()
    .describe('The search query / keyword to recall memories about'),
  limit: z
    .number()
    .min(1)
    .max(20)
    .default(5)
    .describe('How many memories to retrieve'),
});
