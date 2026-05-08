import { SystemPromptService } from '../../services/system-prompt';

export function getSkills() {
  return SystemPromptService.listSkills();
}

export function getSkill(name: string) {
  return SystemPromptService.listSkills().find((skill) => skill.name === name);
}
