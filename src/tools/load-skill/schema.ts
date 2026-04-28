import { z } from 'zod';

export const loadSkillInputSchema = z.object({
  url: z.url().describe('URL of the SKILL.md file to load'),
});
