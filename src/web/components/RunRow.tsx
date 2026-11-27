import { Link } from 'wouter';
import type { RunSummary } from '../api/runs';
import { formatDuration, formatShortTimestamp } from './runs/time-format';
import { StatusDot } from './StatusDot';
import { ToolPill } from './ToolPill';

function CallPills({ calls }: { calls: RunSummary['calls'] }) {
  const shown = calls.slice(0, 4);
  const hiddenCount = calls.length - shown.length;

  if (!calls.length) {
    return <ToolPill small muted label="No tool calls" />;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((call, index) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: calls never reorder
          key={index}
          className="flex min-w-0 max-w-56"
        >
          <ToolPill
            small
            emoji={call.emoji}
            label={call.summary || call.name}
            failed={call.failed}
          />
        </span>
      ))}
      {hiddenCount > 0 && <ToolPill small muted label={`+${hiddenCount}`} />}
    </div>
  );
}

function RunTimes({ run }: { run: RunSummary }) {
  return (
    <div className="flex shrink-0 flex-col items-end gap-1 font-mono text-xs text-zinc-500 tabular-nums">
      <span>{formatShortTimestamp(run.startedAt)}</span>
      <span>{formatDuration(run.endedAt - run.startedAt)}</span>
    </div>
  );
}

export function RunRow({ run }: { run: RunSummary }) {
  let statusLabel = 'Succeeded';
  if (run.status === 'error') {
    statusLabel = 'Failed';
  }

  return (
    <Link
      to={`/runs/${run.id}`}
      className="flex items-start gap-3 rounded-md border border-zinc-800 bg-zinc-800/40 px-4 py-3 transition-colors hover:border-teal-400/40 hover:bg-zinc-800/70 focus-visible:outline-2 focus-visible:outline-teal-400"
    >
      <span className="mt-1.5 flex">
        <StatusDot tone={run.status} label={statusLabel} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <CallPills calls={run.calls} />
        {run.failure && (
          <p className="truncate text-red-300 text-xs">✕ {run.failure}</p>
        )}
      </div>
      <RunTimes run={run} />
    </Link>
  );
}
