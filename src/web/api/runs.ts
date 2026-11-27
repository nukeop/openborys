import { RunStore, type StoredRun } from '../../services/runs';
import { failurePlace } from '../components/runs/failure';

function summarize({ id, startedAt, endedAt, result }: StoredRun) {
  let failure: string | null = null;
  if (result.status === 'error') {
    failure = failurePlace(result.calls, result.error);
  }

  return {
    id,
    startedAt,
    endedAt,
    status: result.status,
    failure,
    calls: result.calls.map((call) => ({
      emoji: call.emoji,
      name: call.name,
      summary: call.summary,
      failed: Boolean(call.error),
    })),
  };
}

export async function getRunSummaries() {
  const runs = await RunStore.listRecent(20);

  return runs.map(summarize);
}

export type RunSummary = Awaited<ReturnType<typeof getRunSummaries>>[number];

export function getRun(id: string) {
  return RunStore.get(id);
}
