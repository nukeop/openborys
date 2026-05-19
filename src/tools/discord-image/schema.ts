import z from 'zod';

export const imageInputSchema = z.object({
  prompt: z.string(),
  model: z.enum(['gpt-image-2', 'nano-banana-2']).default('gpt-image-2'),
  imageIds: z.array(z.string()).optional(),
  options: z.record(z.string(), z.string()).optional(),
});
