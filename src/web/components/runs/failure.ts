import type { ScriptToolCall } from '../../../tools/run-script/run-script';

/** The call whose error ended the run: the script did not catch it, so the run has the same error. */
export function findFailedCall(calls: ScriptToolCall[], error: string) {
  const entry = [...calls.entries()].findLast(
    ([, call]) => call.error === error,
  );
  if (!entry) {
    return null;
  }

  const [index, call] = entry;
  return { index, call };
}

export function failurePlace(calls: ScriptToolCall[], error: string) {
  const failed = findFailedCall(calls, error);
  if (!failed) {
    return 'Script error';
  }

  return `Failed in ${failed.call.emoji} ${failed.call.name}`;
}
