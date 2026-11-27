import type { StoredRun } from '../../../services/runs';
import { Stat } from '../Stat';
import { formatDuration, formatTimestamp } from './time-format';

function StatusBadge({ status }: { status: StoredRun['result']['status'] }) {
  if (status === 'error') {
    return (
      <span className="rounded-full bg-red-400/10 px-2 py-0.5 font-medium text-red-300 text-xs">
        Failed
      </span>
    );
  }

  return (
    <span className="rounded-full bg-teal-400/10 px-2 py-0.5 font-medium text-teal-300 text-xs">
      Succeeded
    </span>
  );
}

function callCount(calls: StoredRun['result']['calls']) {
  const failedCount = calls.filter((call) => call.error).length;
  if (!failedCount) {
    return String(calls.length);
  }

  return `${calls.length} · ${failedCount} failed`;
}

export function RunHeader({ run }: { run: StoredRun }) {
  return (
    <header className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <h1 className="font-semibold text-zinc-100">Script run</h1>
        <StatusBadge status={run.result.status} />
      </div>

      <div className="grid grid-cols-2 gap-x-8 gap-y-4 lg:grid-cols-4">
        <Stat label="Started" value={formatTimestamp(run.startedAt)} />
        <Stat
          label="Duration"
          value={formatDuration(run.endedAt - run.startedAt)}
        />
        <Stat label="Calls" value={callCount(run.result.calls)} />
        <Stat label="Message" value={run.sourceMessageId} mono />
      </div>
    </header>
  );
}
