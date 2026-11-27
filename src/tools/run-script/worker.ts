import { format } from 'node:util';
import type { JSONValue } from 'ai';
import * as Comlink from 'comlink';
import type { ScriptHost, ScriptWorker } from './protocol';

declare const self: Worker;

type ScriptTools = Record<string, (input: JSONValue) => Promise<JSONValue>>;
type ScriptConsole = Pick<Console, 'log' | 'info' | 'warn' | 'error'>;

class ScriptEnvironment {
  readonly #tools: ScriptTools;
  readonly #console: ScriptConsole;

  constructor(host: Comlink.Remote<ScriptHost>, toolIds: string[]) {
    this.#tools = Object.fromEntries(
      toolIds.map((id) => [id, (input: JSONValue) => host.callTool(id, input)]),
    );

    const log = (...args: unknown[]) => {
      host.log(format(...args));
    };
    this.#console = { log, info: log, warn: log, error: log };
  }

  async run(code: string) {
    const script = this.#compile(code);
    const value = await script(this.#tools, this.#console);

    return value ?? null;
  }

  #compile(code: string) {
    const transpiler = new Bun.Transpiler({ loader: 'ts' });
    const js = transpiler.transformSync(`async function __run() {\n${code}\n}`);

    return new Function('tools', 'console', `${js}; return __run();`);
  }
}

const scriptWorker: ScriptWorker = {
  run: (code, toolIds) => {
    const host = Comlink.wrap<ScriptHost>(self);
    return new ScriptEnvironment(host, toolIds).run(code);
  },
};

Comlink.expose(scriptWorker, self);
