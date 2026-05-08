import { parseSkill } from '../../services/skills';
import { SystemPromptService } from '../../services/system-prompt';

export function getSkills() {
  return SystemPromptService.listSkills();
}

export function getSkill(name: string) {
  return SystemPromptService.listSkills().find((skill) => skill.name === name);
}

export function unloadSkill(name: string) {
  SystemPromptService.removeSkill(name);
}

export async function loadSkill(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch: ${response.status} ${response.statusText}`,
    );
  }

  const markdown = await response.text();
  const skill = parseSkill(markdown, url);
  SystemPromptService.addSkill(skill);
  return skill;
}
