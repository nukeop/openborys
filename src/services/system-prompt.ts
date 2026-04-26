export class SystemPromptService {
  static #systemPrompt: string = '';

  init = async () => {};

  static setSystemPrompt = (prompt: string) => {
    SystemPromptService.#systemPrompt = prompt;
  };

  static getSystemPrompt = () => {
    return SystemPromptService.#systemPrompt;
  };
}
