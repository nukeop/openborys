import type { ScriptToolCall } from '../../../tools/run-script/run-script';
import { CodeBlock } from './CodeBlock';
import { callStatus } from './call-status';
import { formatJson } from './format-json';

function MissingOutput({ children }: { children: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-zinc-500">Output</span>
      <p className="text-sm text-zinc-500">{children}</p>
    </div>
  );
}

export function CallOutcome({ call }: { call: ScriptToolCall }) {
  if (call.error) {
    return <CodeBlock label="Error" text={call.error} tone="error" />;
  }
  if (callStatus(call) === 'pending') {
    return (
      <MissingOutput>The script ended before this call finished.</MissingOutput>
    );
  }
  if (call.output === undefined) {
    return <MissingOutput>The tool returned nothing.</MissingOutput>;
  }

  return <CodeBlock label="Output" text={formatJson(call.output)} />;
}
