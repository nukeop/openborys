import type { ScriptToolCall } from '../../../tools/run-script/run-script';
import type { StatusTone } from '../StatusDot';

export function callStatus(call: ScriptToolCall): StatusTone {
  if (call.error) {
    return 'error';
  }
  // A call can take 0 ms, so `!call.durationMs` would mark it as pending.
  if (call.durationMs === undefined) {
    return 'pending';
  }

  return 'success';
}
