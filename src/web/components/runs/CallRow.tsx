import clsx from 'clsx';
import type { ScriptToolCall } from '../../../tools/run-script/run-script';
import { StatusDot, type StatusTone } from '../StatusDot';
import { CallOutcome } from './CallOutcome';
import { CallTimeline } from './CallTimeline';
import { CodeBlock } from './CodeBlock';
import { callElementId } from './call-anchor';
import { callStatus } from './call-status';
import { formatJson } from './format-json';
import { formatDuration } from './time-format';

const statusLabels: Record<StatusTone, string> = {
  success: 'Succeeded',
  error: 'Failed',
  pending: 'Unfinished',
};

function CallDuration({ call }: { call: ScriptToolCall }) {
  let text = '';
  if (call.durationMs !== undefined) {
    text = formatDuration(call.durationMs);
  }

  return (
    <span className="shrink-0 font-mono text-xs text-zinc-500 tabular-nums">
      {text}
    </span>
  );
}

function CallHeading({ call, index }: { call: ScriptToolCall; index: number }) {
  const status = callStatus(call);

  return (
    <div className="flex items-center gap-3">
      <span className="shrink-0 font-mono text-xs text-zinc-500 tabular-nums">
        #{index + 1}
      </span>
      <StatusDot tone={status} label={statusLabels[status]} />
      <span aria-hidden="true" className="shrink-0">
        {call.emoji}
      </span>
      <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-baseline sm:gap-3">
        <span className="truncate font-medium text-sm text-zinc-100 sm:shrink-0">
          {call.name}
        </span>
        <span className="truncate font-mono text-xs text-zinc-500">
          {call.summary}
        </span>
      </div>
      <CallDuration call={call} />
    </div>
  );
}

export function CallRow({
  call,
  index,
  runStartedAt,
  runEndedAt,
}: {
  call: ScriptToolCall;
  index: number;
  runStartedAt: number;
  runEndedAt: number;
}) {
  return (
    <details
      id={callElementId(index)}
      open={Boolean(call.error)}
      className={clsx(
        'group scroll-mt-4 rounded-md border bg-zinc-800/40 transition-colors',
        {
          'border-red-500/40': call.error,
          'border-zinc-800 hover:border-zinc-700': !call.error,
        },
      )}
    >
      <summary className="flex cursor-pointer list-none flex-col gap-3 rounded-md px-4 py-3 focus-visible:outline-2 focus-visible:outline-teal-400 [&::-webkit-details-marker]:hidden">
        <CallHeading call={call} index={index} />
        <CallTimeline
          call={call}
          runStartedAt={runStartedAt}
          runEndedAt={runEndedAt}
        />
      </summary>
      <div className="grid gap-3 px-4 pb-4">
        <CodeBlock label="Input" text={formatJson(call.input)} />
        <CallOutcome call={call} />
      </div>
    </details>
  );
}
