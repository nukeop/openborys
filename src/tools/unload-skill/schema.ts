import { z } from 'zod';

export const unloadSkillInputSchema = z.object({
  name: z.string().describe('Name of the skill to unload'),
});
