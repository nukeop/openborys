import { asSchema, type JSONValue, tool } from 'ai';
import type { Message } from 'discord.js';
import { z } from 'zod';
import { RunStore, type StoredRun } from '../../services/runs';
import { StringsService } from '../../services/strings';
import type { ToolWithMeta } from '../../services/tools';
import { runScript } from './run-script';
import { ScriptEmbed } from './script-embed';

type RunScriptStrings = {
  toolName: string;
  toolDescription: string;
  codeDescription: string;
};

type RunScriptInput = {
  code: string;
};

type RunScriptOutput = {
  error?: string;
  logs: JSONValue;
  value: JSONValue;
};

const describeCatalog = (catalog: ToolWithMeta<any, any>[]) =>
  catalog
    .map((entry) => {
      const schema = JSON.stringify(
        asSchema(entry.tool.inputSchema).jsonSchema,
      );

      return `### tools.${entry.id}(input)\n${entry.tool.description}\nInput schema: ${schema}`;
    })
    .join('\n\n');

const truncate = (value: JSONValue, limit: number) => {
  const json = JSON.stringify(value);
  if (json.length <= limit) {
    return value;
  }

  return `${json.slice(0, limit)}\n[truncated: showing ${limit} of ${json.length} characters]`;
};

export const createRunScriptTool = (
  message: Message,
  catalog: ToolWithMeta<any, any>[],
) => {
  const strings = StringsService.get('run-script') as RunScriptStrings;

  const runScriptTool: ToolWithMeta<RunScriptInput, RunScriptOutput> = {
    id: 'run_script',
    name: strings.toolName,
    emoji: '📜',
    isAlwaysAvailable: true,
    hasOwnDisplay: true,
    formatArgs: (args) => args.code,
    tool: tool({
      description: `${strings.toolDescription}\n\n${describeCatalog(catalog)}`,
      inputSchema: z.object({
        code: z.string().describe(strings.codeDescription),
      }),
    }),
    execute: async ({ code }) => {
      const embed = await ScriptEmbed.send(message, runScriptTool);
      const startedAt = Date.now();

      const result = await runScript({
        code,
        tools: catalog,
        onCallsChange: (calls) => embed.showCalls(calls),
      });

      const run: StoredRun = {
        id: Bun.randomUUIDv7(),
        sourceMessageId: message.id,
        startedAt,
        endedAt: Date.now(),
        code,
        result,
      };
      await RunStore.save(run);
      await embed.finish(run);

      return {
        error: result.error,
        logs: truncate(result.logs, 4000),
        value: truncate(result.value ?? null, 8000),
      };
    },
  };

  return runScriptTool;
};
