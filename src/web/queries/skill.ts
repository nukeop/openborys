import type { Skill } from '../../services/system-prompt';

export const skillQuery = (name: string) => ({
  queryKey: ['skill', name] as const,
  queryFn: async (): Promise<Skill> =>
    (await (
      await fetch(`/api/skills/${encodeURIComponent(name)}`)
    ).json()) as Skill,
});
