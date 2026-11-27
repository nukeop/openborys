import type { StoredRun } from '../../../services/runs';
import { CountBadge } from '../CountBadge';
import { CallList } from './CallList';
import { CodeBlock } from './CodeBlock';
import { formatJson } from './format-json';
import { LogList } from './LogList';
import { RunErrorCard } from './RunErrorCard';
import { RunHeader } from './RunHeader';
import { RunSection } from './RunSection';
import { ScriptCode } from './ScriptCode';

export function RunDetails({ run }: { run: StoredRun }) {
  const { result } = run;

  return (
    <>
      <RunHeader run={run} />

      {result.status === 'error' && (
        <RunErrorCard error={result.error} calls={result.calls} />
      )}

      <RunSection title="Script">
        <ScriptCode code={run.code} />
      </RunSection>

      <RunSection
        title="Calls"
        badge={<CountBadge count={result.calls.length} />}
      >
        <CallList run={run} />
      </RunSection>

      {result.logs.length > 0 && (
        <RunSection
          title="Logs"
          badge={<CountBadge count={result.logs.length} />}
        >
          <LogList logs={result.logs} />
        </RunSection>
      )}

      {result.status === 'success' && (
        <RunSection title="Result">
          <CodeBlock text={formatJson(result.value)} />
        </RunSection>
      )}
    </>
  );
}
