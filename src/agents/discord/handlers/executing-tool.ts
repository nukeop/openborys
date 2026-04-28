import type { JSONValue, ToolResultPart } from 'ai';
import { RedisToolCallService } from '../../../services/redis-tool-calls';
import { ToolService } from '../../../services/tools';
import type { StateHandler } from '../types';

export const executingTool: StateHandler = async (ctx) => {
  const call = ctx.currentToolCall!;
  const tool = ToolService.findByIdOrName(call.toolName)!;

  let output: unknown;
  try {
    output = await tool.execute(call.input);
  } catch (err) {
    output = err instanceof Error ? err.message : String(err);
  }

  const resultPart: ToolResultPart = {
    type: 'tool-result',
    toolCallId: call.toolCallId,
    toolName: call.toolName,
    output: { type: 'json', value: output as JSONValue },
  };

  const serverId = ctx.source.guildId ?? 'dm';
  const channelId = ctx.source.channelId;
  const timestamp = Date.now();

  await RedisToolCallService.addToolResult({
    result: resultPart,
    serverId,
    channelId,
    timestamp,
  });

  ctx.messages.push({
    role: 'tool',
    content: [resultPart],
  });

  ctx.currentToolCall = null;

  if (ctx.pendingToolCalls.length > 0) {
    return { type: 'tool-call' };
  }

  return { type: 'thinking' };
};
