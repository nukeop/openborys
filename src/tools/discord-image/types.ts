import type z from 'zod';
import type { imageInputSchema } from './schema';

export type ImageInput = z.infer<typeof imageInputSchema>;
