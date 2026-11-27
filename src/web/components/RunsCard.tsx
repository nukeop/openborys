import { useQuery } from '@tanstack/react-query';
import { runsQuery } from '../queries/runs';
import { CardSkeleton } from './CardSkeleton';
import { CountBadge } from './CountBadge';
import { RunRow } from './RunRow';

export function RunsCard() {
  const { data, isPending } = useQuery(runsQuery);

  if (isPending || !data) {
    return <CardSkeleton />;
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="shrink-0 font-semibold text-zinc-100">
          📜 Recent scripts
        </h2>
        <CountBadge count={data.length} />
      </div>

      {!data.length && (
        <p className="mt-4 text-sm text-zinc-500">No scripts yet.</p>
      )}
      {data.length > 0 && (
        <div className="mt-4 flex max-h-[32rem] flex-col gap-2 overflow-y-auto overscroll-contain">
          {data.map((run) => (
            <RunRow key={run.id} run={run} />
          ))}
        </div>
      )}
    </div>
  );
}
