import type { StoredRun } from '../../../services/runs';
import { CallRow } from './CallRow';
import { formatDuration } from './time-format';

function TimelineScale({ durationMs }: { durationMs: number }) {
  return (
    <div className="flex justify-between font-mono text-[0.6875rem] text-zinc-600 tabular-nums">
      <span>{formatDuration(0)}</span>
      <span>{formatDuration(durationMs)}</span>
    </div>
  );
}

export function CallList({ run }: { run: StoredRun }) {
  const { calls } = run.result;

  if (!calls.length) {
    return (
      <p className="text-sm text-zinc-500">
        The script did not call any tools.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <TimelineScale durationMs={run.endedAt - run.startedAt} />
      {calls.map((call, index) => (
        <CallRow
          // biome-ignore lint/suspicious/noArrayIndexKey: calls never reorder
          key={index}
          call={call}
          index={index}
          runStartedAt={run.startedAt}
          runEndedAt={run.endedAt}
        />
      ))}
    </div>
  );
}
