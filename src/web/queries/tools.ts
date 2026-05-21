import type { ToolsData } from '../api/tools';

export const toolsQuery = {
  queryKey: ['tools'] as const,
  queryFn: async (): Promise<ToolsData> => (await fetch('/api/tools')).json(),
};
