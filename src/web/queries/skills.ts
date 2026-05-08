import type { Skill } from '../../services/system-prompt';

export const skillsQuery = {
  queryKey: ['skills'] as const,
  queryFn: async (): Promise<Skill[]> =>
    (await (await fetch('/api/skills')).json()) as Skill[],
};

export async function unloadSkillMutation(name: string): Promise<void> {
  await fetch(`/api/skills/${encodeURIComponent(name)}`, { method: 'DELETE' });
}

export async function loadSkillMutation(url: string): Promise<Skill> {
  const response = await fetch('/api/skills', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const body = (await response.json()) as { error: string };
    throw new Error(body.error);
  }

  return response.json() as Promise<Skill>;
}
