import type { z } from 'zod';
import type { unloadSkillInputSchema } from './schema';

export type UnloadSkillInput = z.infer<typeof unloadSkillInputSchema>;
