import z from 'zod';

export const imageInputSchema = z.object({
  mode: z.enum(['generate', 'edit']),
  prompt: z.string(),
  model: z.enum(['gpt-image-2', 'nano-banana-2']),
  imageIds: z.array(z.string()).optional(),
  options: z.record(z.string(), z.string()).optional(),
});
