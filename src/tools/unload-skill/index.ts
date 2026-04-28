import { tool } from 'ai';
import { getLogger } from '@logtape/logtape';
import type { ToolWithMeta } from '../../services/tools';
import { SystemPromptService } from '../../services/system-prompt';
import { unloadSkillInputSchema } from './schema';
import type { UnloadSkillInput } from './types';

const logger = getLogger(['OpenBorys', 'tools', 'unload-skill']);

export const unloadSkillTool: ToolWithMeta<UnloadSkillInput, string> = {
  id: 'unload_skill',
  name: 'Unload Skill',
  emoji: '🗑️',
  isAlwaysAvailable: true,
  formatArgs: (args) => args.name,
  execute: async ({ name }) => {
    logger.info('Unloading skill "{name}"', { name });
    SystemPromptService.removeSkill(name);
    return `Unloaded skill "${name}"`;
  },
  tool: tool({
    description:
      'Unload a previously loaded skill by name, removing it from the system prompt.',
    inputSchema: unloadSkillInputSchema,
  }),
};
