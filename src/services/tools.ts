import type { Tool } from 'ai';

type ToolWithMeta<INPUT, OUTPUT> = {
  id: string;
  name: string;
  isAlwaysAvailable: boolean;
  tool: Tool<INPUT, OUTPUT>;
};

export class ToolService {
  static #tools: ToolWithMeta<any, any>[] = [];

  static registerTool = (tool: ToolWithMeta<any, any>) => {
    ToolService.#tools.push(tool);
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
