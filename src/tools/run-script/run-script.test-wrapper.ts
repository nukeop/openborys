import { runScript, type ScriptToolCall } from './run-script';
import { broken, repeat } from './run-script.fixtures';

export const scriptRunner = {
  async run(code: string, options: { timeoutMinutes?: number } = {}) {
    const callUpdates: ScriptToolCall[][] = [];
    const result = await runScript({
      code,
      tools: [repeat, broken],
      onCallsChange: (calls) => callUpdates.push(structuredClone(calls)),
      timeoutMinutes: options.timeoutMinutes,
    });

    return { result, callUpdates };
  },
};
