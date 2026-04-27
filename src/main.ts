import { getLogger } from '@logtape/logtape';
import { tool } from 'ai';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import z from 'zod';
import { run as runDiscord } from './clients/discord/discord';
import { run as runMatrix } from './clients/matrix/matrix';
import { run as runTui } from './clients/tui/tui';
import { loadEnvironment } from './environment';
import { initLogger } from './logger';
import { loadPrompts } from './prompts';
import { SystemPromptService } from './services/system-prompt';
import { ToolService } from './services/tools';

const logger = getLogger(['OpenBorys', 'main']);
const PLATFORMS = ['matrix', 'discord', 'tui'] as const;
type Platform = (typeof PLATFORMS)[number];

const runners: Record<Platform, () => void | Promise<void>> = {
  matrix: runMatrix,
  discord: runDiscord,
  tui: runTui,
};

const argv = await yargs(hideBin(process.argv))
  .option('platform', {
    type: 'string',
    choices: PLATFORMS,
    demandOption: true,
    describe: 'Which platform to run on',
    default: 'discord',
  })
  .strict()
  .parseAsync();

const platform: Platform = argv.platform as Platform;

const run = async () => {
  const env = loadEnvironment();
  await initLogger();
  logger.info('Environment validated ({count} variables) in {mode} mode', {
    count: Object.keys(env).length,
    mode: env.NODE_ENV,
  });
  const prompts = await loadPrompts();
  SystemPromptService.setSystemPrompt(prompts);
  ToolService.registerTool({
    id: 'base__test_tool',
    name: 'Test tool',
    isAlwaysAvailable: true,
    tool: tool({
      description: 'This is a test tool!',
      inputSchema: z.object({}),
      execute: async () => 'It works!',
    }),
  });
  logger.info('Initializing OpenBorys on {platform}', {
    platform,
  });
  await runners[platform]();
};

run().catch((error) => {
  logger.fatal('Fatal error during startup', { error });
  process.exit(1);
});
