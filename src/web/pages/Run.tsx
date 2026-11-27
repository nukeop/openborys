import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'wouter';
import { CardSkeleton } from '../components/CardSkeleton';
import { RunDetails } from '../components/runs/RunDetails';
import { runQuery } from '../queries/run';

function Notice({ children }: { children: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-400 sm:p-6">
      {children}
    </div>
  );
}

function RunContent({ id }: { id: string }) {
  const { data, isPending, isError } = useQuery(runQuery(id));

  if (isPending) {
    return <CardSkeleton />;
  }
  if (isError) {
    return <Notice>Could not load this run. Try again in a moment.</Notice>;
  }
  if (!data) {
    return (
      <Notice>
        This run does not exist or has expired. Runs are kept for 30 days.
      </Notice>
    );
  }

  return <RunDetails run={data} />;
}

export function Run() {
  const params = useParams<{ id: string }>();

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-3 py-6 sm:space-y-6 sm:p-8">
      <title>Script run</title>
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-teal-400 focus-visible:outline-2 focus-visible:outline-teal-400"
      >
        &larr; Dashboard
      </Link>
      <RunContent id={params.id ?? ''} />
    </div>
  );
}
