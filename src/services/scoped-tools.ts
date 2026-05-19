import { getLogger } from '@logtape/logtape';
import type { ToolWithMeta } from './tools';

const logger = getLogger(['OpenBorys', 'Service', 'ScopedToolService']);

export class ScopedToolService {
  static #tools: Map<string, ToolWithMeta<any, any>[]> = new Map();

  static registerTool = (tool: ToolWithMeta<any, any>, scope: string) => {
    const tools = ScopedToolService.#tools.get(scope);
    if (tools) {
      ScopedToolService.#tools.set(scope, [...tools, tool]);
    } else {
      ScopedToolService.#tools.set(scope, [tool]);
    }
  };

  static getToolsForScope = (scope: string): ToolWithMeta<any, any>[] => {
    return ScopedToolService.#tools.get(scope) ?? [];
  };

  static findToolInScope = (
    scope: string,
    idOrName: string,
  ): ToolWithMeta<any, any> | undefined => {
    const tools = ScopedToolService.#tools.get(scope);
    if (!tools) {
      return undefined;
    }

    const matchById = tools.find((entry) => entry.id === idOrName);
    if (matchById) {
      return matchById;
    }
    return tools.find((entry) => entry.name === idOrName);
  };

  static clearScope = (scope: string) => {
    ScopedToolService.#tools.delete(scope);
  };
}
