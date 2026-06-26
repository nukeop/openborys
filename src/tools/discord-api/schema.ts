import { z } from 'zod';

export const createDiscordApiInputSchema = (codeDescription: string) =>
  z.object({
    code: z.string().describe(codeDescription),
  });
