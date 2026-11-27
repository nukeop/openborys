import { runScript, type ScriptToolCall } from './run-script';
import { broken, repeat } from './run-script.fixtures';

export const scriptRunner = {
  async run(code: string, options: { timeoutMinutes?: number } = {}) {
    const startedCalls: ScriptToolCall[] = [];
    const result = await runScript({
      code,
      tools: [repeat, broken],
      onToolCall: (call) => startedCalls.push({ ...call }),
      timeoutMinutes: options.timeoutMinutes,
    });
    return { result, startedCalls };
  },
};
