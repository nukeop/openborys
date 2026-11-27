import type { StoredRun } from '../../services/runs';

export const runQuery = (id: string) => ({
  queryKey: ['run', id] as const,
  queryFn: async (): Promise<StoredRun | null> => {
    const response = await fetch(`/api/runs/${encodeURIComponent(id)}`);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Failed to load run: ${response.status}`);
    }

    return (await response.json()) as StoredRun;
  },
});
