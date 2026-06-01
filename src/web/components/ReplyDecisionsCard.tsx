import { useQuery } from '@tanstack/react-query';
import type { ReplyDecision } from '../../clients/discord/reply-decision/store';
import { replyDecisionsQuery } from '../queries/reply-decisions';
import { CardSkeleton } from './CardSkeleton';

const timestampFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'short',
  timeStyle: 'short',
});

function DecisionRow({ decision }: { decision: ReplyDecision }) {
  const dotColor = decision.shouldReply ? 'bg-teal-400' : 'bg-zinc-600';

  return (
    <div className="flex items-start gap-3 rounded-md border border-zinc-800 bg-zinc-800/40 px-4 py-3">
      <span
        className={`mt-1.5 size-2 shrink-0 rounded-full ${dotColor}`}
        title={decision.shouldReply ? 'Replied' : 'Skipped'}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-sm text-zinc-300">{decision.reason}</span>
        <span className="font-mono text-xs text-zinc-500">
          {timestampFormat.format(decision.timestamp)}
        </span>
      </div>
    </div>
  );
}

export function ReplyDecisionsCard() {
  const { data, isPending } = useQuery(replyDecisionsQuery);

  if (isPending || !data) {
    return <CardSkeleton />;
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="shrink-0 font-semibold text-zinc-100">
          Reply decisions
        </h2>
        <span className="shrink-0 rounded-full bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-400">
          {data.length}
        </span>
      </div>

      {!data.length && (
        <p className="mt-4 text-sm text-zinc-500">No decisions yet.</p>
      )}
      {data.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {data.map((decision) => (
            <DecisionRow key={decision.timestamp} decision={decision} />
          ))}
        </div>
      )}
    </div>
  );
}
