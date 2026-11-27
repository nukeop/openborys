import { Link } from 'wouter';
import type { RunSummary } from '../api/runs';
import { formatDuration, formatShortTimestamp } from './runs/time-format';

function StatusEdge({ status }: { status: RunSummary['status'] }) {
  let color = 'bg-teal-400';
  let label = 'Succeeded';
  if (status === 'error') {
    color = 'bg-red-400';
    label = 'Failed';
  }

  return (
    <>
      <span
        aria-hidden="true"
        className={`absolute inset-y-2 left-0 w-0.5 rounded-full ${color}`}
      />
      <span className="sr-only">{label}</span>
    </>
  );
}

function CallEmojis({ emojis }: { emojis: string[] }) {
  if (!emojis.length) {
    return <span className="text-sm text-zinc-500">No tool calls</span>;
  }

  return (
    <span className="flex flex-wrap gap-x-1 text-lg leading-7">
      {emojis.map((emoji, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: calls never reorder
        <span key={index}>{emoji}</span>
      ))}
    </span>
  );
}

export function RunRow({ run }: { run: RunSummary }) {
  return (
    <Link
      to={`/runs/${run.id}`}
      className="relative flex items-center gap-4 rounded-md py-2 pr-2 pl-4 transition-colors hover:bg-zinc-800/50 focus-visible:outline-2 focus-visible:outline-teal-400"
    >
      <StatusEdge status={run.status} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <CallEmojis emojis={run.emojis} />
        {run.error && (
          <p className="truncate text-red-300/80 text-xs">{run.error}</p>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5 font-mono text-xs tabular-nums">
        <span className="text-zinc-500">
          {formatShortTimestamp(run.startedAt)}
        </span>
        <span className="text-zinc-400">
          {formatDuration(run.endedAt - run.startedAt)}
        </span>
      </div>
    </Link>
  );
}
