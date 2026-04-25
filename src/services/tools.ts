import { type Tool, tool } from "ai";
import { z } from "zod";

export type ToolEntry<T extends z.ZodType = z.ZodType> = {
  id: string;
  name: string;
  description: string;
  inputSchema: T;
  execute: (input: z.infer<T>) => unknown | Promise<unknown>;
};

export type ToolMetadata = {
  id: string;
  name: string;
  description: string;
};

const registry = new Map<string, ToolEntry>();

const findByIdOrName = (idOrName: string): ToolEntry | undefined => {
  const direct = registry.get(idOrName);
  if (direct) return direct;
  for (const entry of registry.values()) {
    if (entry.name === idOrName) return entry;
  }
  return undefined;
};

const toAITool = (entry: ToolEntry): Tool =>
  tool({
    description: entry.description,
    inputSchema: entry.inputSchema,
    execute: async (input) => entry.execute(input),
  });

export const add = <T extends z.ZodType>(entry: ToolEntry<T>): void => {
  registry.set(entry.id, entry as unknown as ToolEntry);
};

export const remove = (idOrName: string): boolean => {
  const entry = findByIdOrName(idOrName);
  if (!entry) return false;
  return registry.delete(entry.id);
};

export const get = (idOrName: string): ToolEntry | undefined =>
  findByIdOrName(idOrName);

export const search = (term: string): ToolMetadata[] => {
  const t = term.toLowerCase();
  return Array.from(registry.values())
    .filter(
      (e) =>
        e.id.toLowerCase().includes(t) ||
        e.name.toLowerCase().includes(t) ||
        e.description.toLowerCase().includes(t),
    )
    .map(({ id, name, description }) => ({ id, name, description }));
};

export const all = (): Record<string, Tool> => {
  const out: Record<string, Tool> = {};
  for (const entry of registry.values()) {
    out[entry.name] = toAITool(entry);
  }
  return out;
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
