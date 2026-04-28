import { anthropic } from '@ai-sdk/anthropic';
import { getLogger } from '@logtape/logtape';
import type { ToolWithMeta } from '../services/tools';

const logger = getLogger(['OpenBorys', 'tools', 'bash']);

export const bashTool: ToolWithMeta<{ command: string }, string> = {
  id: 'bash',
  name: 'Bash',
  emoji: '🖥️',
  isAlwaysAvailable: true,
  formatArgs: (args) => args.command,
  execute: async ({ command }) => {
    logger.info('Running bash: {command}', { command });
    const proc = Bun.spawn(['bash', '-c', command], {
      stdout: 'pipe',
      stderr: 'pipe',
    });
    const [stdout, stderr] = await Promise.all([
      new Response(proc.stdout).text(),
      new Response(proc.stderr).text(),
    ]);
    await proc.exited;
    return [stdout, stderr].filter(Boolean).join('\n');
  },
  tool: anthropic.tools.bash_20250124({}),
};
