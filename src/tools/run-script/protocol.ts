import type { JSONValue } from 'ai';

export type ScriptHost = {
  callTool(toolId: string, input: JSONValue): Promise<JSONValue>;
  log(line: string): void;
};

export type ScriptWorker = {
  run(code: string, toolIds: string[]): Promise<JSONValue>;
};
