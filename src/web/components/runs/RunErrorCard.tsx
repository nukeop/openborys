import type { ScriptToolCall } from '../../../tools/run-script/run-script';
import { callElementId } from './call-anchor';
import { failurePlace, findFailedCall } from './failure';

export function RunErrorCard({
  error,
  calls,
}: {
  error: string;
  calls: ScriptToolCall[];
}) {
  const failed = findFailedCall(calls, error);

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-red-500/30 bg-red-500/5 p-4 sm:p-6">
      <h2 className="font-semibold text-red-300">
        ✕ {failurePlace(calls, error)}
      </h2>
      <pre className="whitespace-pre-wrap font-mono text-red-200/90 text-sm [overflow-wrap:anywhere]">
        {error}
      </pre>
      {failed && (
        <a
          href={`#${callElementId(failed.index)}`}
          className="self-start text-red-300 text-sm underline decoration-red-300/40 underline-offset-4 transition-colors hover:text-red-200 hover:decoration-red-200 focus-visible:outline-2 focus-visible:outline-red-300"
        >
          Show the call ↓
        </a>
      )}
    </section>
  );
}
