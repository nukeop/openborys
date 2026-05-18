import { getLogger } from '@logtape/logtape';
import type { JSONValue, ToolResultPart } from 'ai';
import { RedisToolCallService } from '../../../services/redis-tool-calls';
import { ScopedToolService } from '../../../services/scoped-tools';
import { ToolService } from '../../../services/tools';
import { errorMessage } from '../../../utils/error';
import type { StateHandler } from '../types';

const logger = getLogger([
  'OpenBorys',
  'Agent',
  'Discord',
  'EventHandlers',
  'ExecutingTool',
]);

export const executingTool: StateHandler = async (ctx) => {
  const call = ctx.currentToolCall!;
  let tool = ToolService.findByIdOrName(call.toolName);
  if (!tool) {
    tool = ScopedToolService.findToolInScope(ctx.source.id, call.toolName);
  }

  if (!tool) {
    logger.error('Tool not found: {toolName}. This should never happen.', {
      toolName: call.toolName,
    });
    throw new Error(`Tool not found: ${call.toolName}`);
  }

  let output: unknown;
  try {
    output = await tool.execute(call.input);
  } catch (err) {
    output = errorMessage(err);
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
