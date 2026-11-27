import type { ScriptToolCall } from '../../../tools/run-script/run-script';
import { type CallStatus, callStatus } from './call-status';

const barColors: Record<CallStatus, string> = {
  success: 'bg-teal-400',
  error: 'bg-red-400',
  pending: 'bg-zinc-500',
};

/** Where the call sits inside the whole run, so parallel calls show as overlapping bars. */
export function CallTimeline({
  call,
  runStartedAt,
  runEndedAt,
}: {
  call: ScriptToolCall;
  runStartedAt: number;
  runEndedAt: number;
}) {
  const runDuration = Math.max(runEndedAt - runStartedAt, 1);
  const callDuration = call.durationMs ?? runEndedAt - call.startedAt;
  const offset = ((call.startedAt - runStartedAt) / runDuration) * 100;
  const width = (callDuration / runDuration) * 100;

  return (
    <div aria-hidden="true" className="relative h-1 rounded-full bg-zinc-800">
      <div
        className={`absolute inset-y-0 min-w-0.5 rounded-full ${barColors[callStatus(call)]}`}
        style={{ left: `${offset}%`, width: `${width}%` }}
      />
    </div>
  );
}
