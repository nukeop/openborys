import type { Skill } from '../../services/system-prompt';

export const skillsQuery = {
  queryKey: ['skills'] as const,
  queryFn: async (): Promise<Skill[]> =>
    (await (await fetch('/api/skills')).json()) as Skill[],
};
