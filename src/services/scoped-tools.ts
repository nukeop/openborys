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

  // Factories allow dynamically loaded plugins to register platform-specific,
  // scoped tools.

  // Factory context is `any` because each platform passes a different type
  // (Discord passes Message, Matrix would pass its own event type, etc.)
  // and this service is platform-agnostic. The alternative is a generic
  // PlatformContextMap that couples this file to every platform's types.
  static #factories: Map<
    string,
    Array<(context: any) => ToolWithMeta<any, any>>
  > = new Map();

  static registerScopedToolFactory = (
    platform: string,
    factory: (context: any) => ToolWithMeta<any, any>,
  ) => {
    const existing = ScopedToolService.#factories.get(platform);
    if (existing) {
      ScopedToolService.#factories.set(platform, [...existing, factory]);
    } else {
      ScopedToolService.#factories.set(platform, [factory]);
    }
  };

  static instantiateFactories = (
    platform: string,
    context: any,
    scope: string,
  ) => {
    const factories = ScopedToolService.#factories.get(platform) ?? [];
    for (const factory of factories) {
      ScopedToolService.registerTool(factory(context), scope);
    }
  };
}
