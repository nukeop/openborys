import type { RunSummary } from '../api/runs';

export const runsQuery = {
  queryKey: ['runs'] as const,
  queryFn: async (): Promise<RunSummary[]> =>
    (await (await fetch('/api/runs')).json()) as RunSummary[],
};
