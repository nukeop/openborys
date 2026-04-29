import type z from 'zod';
import type { rememberInputSchema } from './schema';

export type RememberInput = z.infer<typeof rememberInputSchema>;
