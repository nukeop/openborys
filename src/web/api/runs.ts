import { RunStore } from '../../services/runs';

export async function getRunSummaries() {
  const runs = await RunStore.listRecent(20);

  return runs.map((run) => ({
    id: run.id,
    startedAt: run.startedAt,
    endedAt: run.endedAt,
    status: run.result.status,
    error: run.result.error,
    emojis: run.result.calls.map((call) => call.emoji),
  }));
}

export type RunSummary = Awaited<ReturnType<typeof getRunSummaries>>[number];

export function getRun(id: string) {
  return RunStore.get(id);
}
