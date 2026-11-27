import { asSchema, type FlexibleSchema, type JSONValue } from 'ai';
import * as Comlink from 'comlink';
import type { ToolWithMeta } from '../../services/tools';
import { errorMessage } from '../../utils/error';
import type { ScriptHost, ScriptWorker } from './protocol';

export type ScriptToolCall = {
  toolId: string;
  name: string;
  emoji: string;
  input: JSONValue;
  output?: JSONValue;
  error?: string;
  startedAt: number;
  durationMs?: number;
};

type ScriptOutcome =
  | { status: 'success'; value: JSONValue; error?: undefined }
  | { status: 'error'; error: string; value?: undefined };

export type ScriptResult = ScriptOutcome & {
  logs: string[];
  calls: ScriptToolCall[];
};

class ScriptRun {
  readonly #result = Promise.withResolvers<ScriptResult>();
  readonly #logs: string[] = [];
  readonly #calls: ScriptToolCall[] = [];
  readonly #worker: Worker;
  readonly #tools: Map<string, ToolWithMeta<any, any>>;
  readonly #onToolCall: (call: ScriptToolCall) => void;
  #timer?: Timer;

  constructor(
    worker: Worker,
    tools: ToolWithMeta<any, any>[],
    onToolCall: (call: ScriptToolCall) => void,
  ) {
    this.#worker = worker;
    this.#tools = new Map(tools.map((tool) => [tool.id, tool]));
    this.#onToolCall = onToolCall;
  }

  run(code: string, timeoutMinutes: number) {
    Comlink.expose(this.#host(), this.#worker);
    this.#worker.onerror = (event) => {
      this.#finish({ status: 'error', error: event.message });
    };
    this.#timer = setTimeout(() => {
      const error = `Script timed out after ${timeoutMinutes} minutes`;
      this.#finish({ status: 'error', error });
    }, timeoutMinutes * 60_000);

    const script = Comlink.wrap<ScriptWorker>(this.#worker);
    script.run(code, [...this.#tools.keys()]).then(
      (value) => this.#finish({ status: 'success', value }),
      (error) => this.#finish({ status: 'error', error: errorMessage(error) }),
    );

    return this.#result.promise;
  }

  #host(): ScriptHost {
    return {
      callTool: (toolId, input) => this.#callTool(toolId, input),
      log: (line) => {
        this.#logs.push(line);
      },
    };
  }

  async #callTool(toolId: string, input: JSONValue) {
    const tool = this.#tools.get(toolId);
    if (!tool) {
      throw new Error(`Unknown tool: ${toolId}`);
    }

    const call: ScriptToolCall = {
      toolId,
      name: tool.name,
      emoji: tool.emoji,
      input,
      startedAt: Date.now(),
    };
    this.#calls.push(call);
    this.#onToolCall(call);

    try {
      const validInput = await this.#validate(tool.tool.inputSchema, input);
      const output = await tool.execute(validInput);
      call.output = output;
      return output;
    } catch (error) {
      call.error = errorMessage(error);
      throw error;
    } finally {
      call.durationMs = Date.now() - call.startedAt;
    }
  }

  async #validate(inputSchema: FlexibleSchema<unknown>, input: JSONValue) {
    const schema = asSchema(inputSchema);
    if (!schema.validate) {
      return input;
    }

    const validation = await schema.validate(input);
    if (!validation.success) {
      throw validation.error;
    }

    return validation.value;
  }

  #finish(outcome: ScriptOutcome) {
    clearTimeout(this.#timer);
    this.#worker.terminate();
    this.#result.resolve({ ...outcome, logs: this.#logs, calls: this.#calls });
  }
}

export const runScript = ({
  code,
  tools,
  onToolCall,
  timeoutMinutes = 10,
}: {
  code: string;
  tools: ToolWithMeta<any, any>[];
  onToolCall: (call: ScriptToolCall) => void;
  timeoutMinutes?: number;
}) => {
  const worker = new Worker(import.meta.resolve('./worker.ts'));
  return new ScriptRun(worker, tools, onToolCall).run(code, timeoutMinutes);
};
