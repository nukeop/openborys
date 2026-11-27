import { IoChevronForward } from 'react-icons/io5';
import type { ScriptToolCall } from '../../../tools/run-script/run-script';
import { CallOutcome } from './CallOutcome';
import { CallTimeline } from './CallTimeline';
import { CodeBlock } from './CodeBlock';
import { type CallStatus, callStatus } from './call-status';
import { formatJson } from './format-json';
import { formatDuration } from './time-format';

const statusIcons: Record<CallStatus, { icon: string; label: string }> = {
  success: { icon: '✅', label: 'Succeeded' },
  error: { icon: '❌', label: 'Failed' },
  pending: { icon: '⏳', label: 'Unfinished' },
};

function CallDuration({ call }: { call: ScriptToolCall }) {
  let text = '';
  if (call.durationMs !== undefined) {
    text = formatDuration(call.durationMs);
  }

  return (
    <span className="w-12 shrink-0 text-right font-mono text-xs text-zinc-400 tabular-nums">
      {text}
    </span>
  );
}

function CallHeading({ call }: { call: ScriptToolCall }) {
  const status = statusIcons[callStatus(call)];

  return (
    <div className="flex items-center gap-3">
      <IoChevronForward
        aria-hidden="true"
        className="size-3.5 shrink-0 text-zinc-500 transition-transform duration-150 group-open:rotate-90"
      />
      <span aria-hidden="true" className="text-lg leading-none">
        {call.emoji}
      </span>
      <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-baseline sm:gap-2">
        <span className="truncate font-medium text-sm text-zinc-200 sm:shrink-0">
          {call.name}
        </span>
        <span className="truncate text-sm text-zinc-500">{call.summary}</span>
      </div>
      <span role="img" aria-label={status.label} title={status.label}>
        {status.icon}
      </span>
      <CallDuration call={call} />
    </div>
  );
}

export function CallRow({
  call,
  runStartedAt,
  runEndedAt,
}: {
  call: ScriptToolCall;
  runStartedAt: number;
  runEndedAt: number;
}) {
  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none flex-col gap-2.5 rounded-md px-2 py-2.5 transition-colors hover:bg-zinc-800/50 focus-visible:outline-2 focus-visible:outline-teal-400 [&::-webkit-details-marker]:hidden">
        <CallHeading call={call} />
        <CallTimeline
          call={call}
          runStartedAt={runStartedAt}
          runEndedAt={runEndedAt}
        />
      </summary>
      <div className="grid gap-3 px-2 pt-1 pb-4 sm:pl-8">
        <CodeBlock label="Input" text={formatJson(call.input)} />
        <CallOutcome call={call} />
      </div>
    </details>
  );
}
