import z from 'zod';

export const friendSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  descriptionSecondPerson: z.string().min(1),
});
