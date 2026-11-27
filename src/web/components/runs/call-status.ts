import type { ScriptToolCall } from '../../../tools/run-script/run-script';

export type CallStatus = 'pending' | 'error' | 'success';

export function callStatus(call: ScriptToolCall): CallStatus {
  if (call.error) {
    return 'error';
  }
  // A call can take 0 ms, so `!call.durationMs` would mark it as pending.
  if (call.durationMs === undefined) {
    return 'pending';
  }

  return 'success';
}
