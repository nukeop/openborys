import type { z } from 'zod';
import type { loadSkillInputSchema } from './schema';

export type LoadSkillInput = z.infer<typeof loadSkillInputSchema>;
