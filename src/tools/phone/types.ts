import type { z } from 'zod';
import type { phoneInputSchema } from './schema';

export type PhoneInput = z.infer<typeof phoneInputSchema>;
