import type { z } from 'zod';
import type { webFetchInputSchema } from './schema';

export type WebFetchInput = z.infer<typeof webFetchInputSchema>;
