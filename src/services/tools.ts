import { type Tool, tool } from "ai";
import { z } from "zod";

export type ToolEntry<Schema extends z.ZodType = z.ZodType> = {
  id: string;
  name: string;
  description: string;
  inputSchema: Schema;
  execute: (input: z.infer<Schema>) => unknown | Promise<unknown>;
};

export type ToolMetadata = {
  id: string;
  name: string;
  description: string;
};

const registry = new Map<string, ToolEntry>();

const findByIdOrName = (idOrName: string): ToolEntry | undefined => {
  const directHit = registry.get(idOrName);
  if (directHit) {
    return directHit;
  }
  return Array.from(registry.values()).find((entry) => entry.name === idOrName);
};

const toAITool = (entry: ToolEntry): Tool =>
  tool({
    description: entry.description,
    inputSchema: entry.inputSchema,
    execute: async (input) => entry.execute(input),
  });

export const add = <Schema extends z.ZodType>(
  entry: ToolEntry<Schema>,
): void => {
  registry.set(entry.id, entry as unknown as ToolEntry);
};

export const remove = (idOrName: string): boolean => {
  const entry = findByIdOrName(idOrName);
  if (!entry) {
    return false;
  }
  return registry.delete(entry.id);
};

export const get = (idOrName: string): ToolEntry | undefined => {
  return findByIdOrName(idOrName);
};

export const search = (term: string): ToolMetadata[] => {
  const lowercaseTerm = term.toLowerCase();
  const matches = Array.from(registry.values()).filter((entry) => {
    const idMatch = entry.id.toLowerCase().includes(lowercaseTerm);
    const nameMatch = entry.name.toLowerCase().includes(lowercaseTerm);
    const descriptionMatch = entry.description
      .toLowerCase()
      .includes(lowercaseTerm);
    return idMatch || nameMatch || descriptionMatch;
  });
  return matches.map((entry) => ({
    id: entry.id,
    name: entry.name,
    description: entry.description,
  }));
};

export const all = (): Record<string, Tool> => {
  const entries = Array.from(registry.values()).map((entry) => [
    entry.name,
    toAITool(entry),
  ]);
  return Object.fromEntries(entries);
};

export const searchTool: Tool = tool({
  description:
    "Search the registry of available tools by name, id, or description. Returns metadata for matching tools.",
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        "Search term matched against each tool's id, name, and description",
      ),
  }),
  execute: async ({ query }) => search(query),
});

export const tools = {
  add,
  remove,
  get,
  search,
  all,
  searchTool,
};
