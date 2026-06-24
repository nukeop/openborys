import { useQuery } from '@tanstack/react-query';
import { phoneCallsQuery } from '../queries/phone-calls';
import { CardSkeleton } from './CardSkeleton';
import { ContactRow } from './ContactRow';

export function PhoneCallsCard() {
  const { data, isPending } = useQuery(phoneCallsQuery);

  if (isPending || !data) {
    return <CardSkeleton />;
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="shrink-0 font-semibold text-zinc-100">
          📱 Recent calls
        </h2>
        <span className="shrink-0 rounded-full bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-400">
          {data.length}
        </span>
      </div>

      {data.length === 0 && (
        <p className="mt-4 text-sm text-zinc-500">No calls yet.</p>
      )}
      {data.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {data.map((message) => (
            <ContactRow key={message.timestamp} message={message} />
          ))}
        </div>
      )}
    </div>
  );
}
