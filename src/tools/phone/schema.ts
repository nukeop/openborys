import { z } from 'zod';

export const phoneInputSchema = z.object({
  contact: z.string(),
  message: z.string(),
});
