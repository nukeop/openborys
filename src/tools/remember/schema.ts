import z from "zod";

export const rememberInputSchema = z.object({
  content: z.string().describe('Content of the memory to remember'),
})
