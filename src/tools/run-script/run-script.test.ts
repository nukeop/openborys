import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  setSystemTime,
} from 'bun:test';
import { scriptRunner } from './run-script.test-wrapper';

describe('runScript', () => {
  const now = new Date('2026-11-26T12:00:00.000Z');

  beforeEach(() => {
    setSystemTime(now);
  });

  afterEach(() => {
    setSystemTime();
  });

  it('returns the value, the logs, and the recorded calls', async () => {
    const { result } = await scriptRunner.run(
      `console.log('repeating', 2);
      return await tools.repeat({ text: 'ab', times: 2 });`,
    );

    expect(result).toEqual({
      status: 'success',
      value: 'abab',
      logs: ['repeating 2'],
      calls: [
        {
          toolId: 'repeat',
          name: 'Repeat',
          emoji: '🔁',
          summary: 'ab',
          input: { text: 'ab', times: 2 },
          startedAt: now.getTime(),
          output: 'abab',
          durationMs: 1500,
        },
      ],
    });
  });

  it('reports the calls when a call starts and when it ends', async () => {
    const { callUpdates } = await scriptRunner.run(
      `return tools.repeat({ text: 'ab', times: 2 });`,
    );

    const startedCall = {
      toolId: 'repeat',
      name: 'Repeat',
      emoji: '🔁',
      summary: 'ab',
      input: { text: 'ab', times: 2 },
      startedAt: now.getTime(),
    };
    expect(callUpdates).toEqual([
      [startedCall],
      [{ ...startedCall, output: 'abab', durationMs: 1500 }],
    ]);
  });

  it('applies the zod defaults to tool inputs', async () => {
    const { result } = await scriptRunner.run(
      `return tools.repeat({ text: 'ab' });`,
    );

    expect(result.value).toBe('ababab');
  });

  it('gives each parallel tool call its own result', async () => {
    const { result } = await scriptRunner.run(
      `return Promise.all([
        tools.repeat({ text: 'a', times: 1 }),
        tools.repeat({ text: 'b', times: 2 }),
      ]);`,
    );

    expect(result.value).toEqual(['a', 'bb']);
  });

  it('lets the script catch a tool error', async () => {
    const { result } = await scriptRunner.run(
      `try { await tools.broken({}); } catch (e) { return e.message; }`,
    );

    expect(result.value).toBe('Tool broke');
  });

  it('gives the error of a script that throws', async () => {
    const { result } = await scriptRunner.run(`throw new Error('Oops');`);

    expect(result).toEqual({
      status: 'error',
      error: 'Oops',
      logs: [],
      calls: [],
    });
  });

  it('stops a script that runs too long', async () => {
    const { result } = await scriptRunner.run('while (true) {}', {
      timeoutMinutes: 0.001,
    });

    expect(result).toEqual({
      status: 'error',
      error: 'Script timed out after 0.001 minutes',
      logs: [],
      calls: [],
    });
  });
});
