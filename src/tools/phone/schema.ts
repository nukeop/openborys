import { z } from 'zod';

export const phoneInputSchema = z.object({
  contact: z.string(),
  message: z.string(),
  imageIds: z
    .array(z.string())
    .optional()
    .describe('IDs of image attachments to include with the message.'),
});
