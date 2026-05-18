import type { Tool } from 'ai';

export type ToolWithMeta<INPUT, OUTPUT> = {
  id: string;
  name: string;
  emoji: string;
  isAlwaysAvailable: boolean;
  formatArgs: (args: INPUT) => string;
  execute: (input: INPUT) => Promise<OUTPUT>;
  tool: Tool<INPUT, any>;
};

export class ToolService {
  static #tools: ToolWithMeta<any, any>[] = [];

  static registerTool = (tool: ToolWithMeta<any, any>) => {
    ToolService.#tools.push(tool);
  };

  static unregisterTool = (id: string) => {
    ToolService.#tools = ToolService.#tools.filter((entry) => entry.id !== id);
  };

  static findByIdOrName = (
    idOrName: string,
  ): ToolWithMeta<unknown, unknown> | undefined => {
    const matchById = ToolService.#tools.find((entry) => entry.id === idOrName);
    if (matchById) {
      return matchById;
    }
    return ToolService.#tools.find((entry) => entry.name === idOrName);
  };

  static getAlwaysAvailableTools = (): ToolWithMeta<unknown, unknown>[] =>
    ToolService.#tools.filter((entry) => entry.isAlwaysAvailable);
}

export const toAITools = (toolsWithMeta: ToolWithMeta<any, any>[]) =>
  Object.fromEntries(
    toolsWithMeta.map((toolWithMeta) => [toolWithMeta.id, toolWithMeta.tool]),
  );
