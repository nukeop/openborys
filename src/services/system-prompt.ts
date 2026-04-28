export type Skill = {
  name: string;
  description: string;
  body: string;
  sourceUrl: string;
};

export class SystemPromptService {
  static #basePrompt: string = '';
  static #skills: Skill[] = [];

  init = async () => {};

  static setBasePrompt = (prompt: string) => {
    SystemPromptService.#basePrompt = prompt;
  };

  static addSkill = (skill: Skill) => {
    SystemPromptService.removeSkill(skill.name);
    SystemPromptService.#skills = [
      ...SystemPromptService.#skills,
      skill,
    ];
  };

  static removeSkill = (name: string) => {
    SystemPromptService.#skills = SystemPromptService.#skills.filter(
      (entry) => entry.name !== name,
    );
  };

  static listSkills = (): Skill[] => SystemPromptService.#skills;

  static getSystemPrompt = (): string => {
    const skills = SystemPromptService.#skills.map(
      (skill) =>
        `<skill name="${skill.name}" description="${skill.description}" source="${skill.sourceUrl}">\n${skill.body}\n</skill>`,
    );
    return [SystemPromptService.#basePrompt, ...skills].join('\n\n');
  };
}
