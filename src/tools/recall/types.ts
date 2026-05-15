import type z from 'zod';
import type { recallInputSchema } from './schema';

export type RecallInput = z.infer<typeof recallInputSchema>;
