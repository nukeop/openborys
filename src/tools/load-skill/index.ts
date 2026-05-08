import { tool } from 'ai';
import { getLogger } from '@logtape/logtape';
import type { ToolWithMeta } from '../../services/tools';
import { SystemPromptService } from '../../services/system-prompt';
import { parseSkill } from '../../services/skills';
import { errorMessage } from '../../utils/error';
import { loadSkillInputSchema } from './schema';
import type { LoadSkillInput } from './types';

const logger = getLogger(['OpenBorys', 'tools', 'load-skill']);

export const loadSkillTool: ToolWithMeta<LoadSkillInput, string> = {
  id: 'load_skill',
  name: 'Load Skill',
  emoji: '📚',
  isAlwaysAvailable: true,
  formatArgs: (args) => args.url,
  execute: async ({ url }) => {
    logger.info('Loading skill from {url}', { url });

    try {
      const response = await fetch(url);
      if (!response.ok) {
        return `Failed to fetch ${url}: ${response.status} ${response.statusText}`;
      }

      const markdown = await response.text();
      const skill = parseSkill(markdown, url);
      SystemPromptService.addSkill(skill);

      return `Loaded skill "${skill.name}": ${skill.description}`;
    } catch (error) {
      return `Failed to load skill: ${errorMessage(error)}`;
    }
  },
  tool: tool({
    description:
      'Load a skill from a SKILL.md file at a URL. The skill instructions will be added to your system prompt at your next turn.',
    inputSchema: loadSkillInputSchema,
  }),
};
