import type { JSONValue, ToolCallPart, ToolResultPart } from 'ai';
import { getLogger } from '@logtape/logtape';
import { RedisToolCallService } from '../../../services/redis-tool-calls';
import type { StateHandler } from '../types';

const logger = getLogger([
  'OpenBorys',
  'Agent',
  'Discord',
  'EventHandlers',
  'ToolCall',
]);

const toToolCallPart = (call: {
  toolCallId: string;
  toolName: string;
  input: unknown;
}): ToolCallPart => ({
  type: 'tool-call',
  toolCallId: call.toolCallId,
  toolName: call.toolName,
  input: call.input,
});

const toToolResultPart = (result: {
  toolCallId: string;
  toolName: string;
  output: unknown;
}): ToolResultPart => ({
  type: 'tool-result',
  toolCallId: result.toolCallId,
  toolName: result.toolName,
  output: { type: 'json', value: result.output as JSONValue },
});

export const toolCall: StateHandler = async (ctx) => {
  if (!ctx.lastResult) {
    logger.error('tool-call handler reached without lastResult');
    return { type: 'error' };
  }

  const result = ctx.lastResult;
  const serverId = ctx.source.guildId ?? 'dm';
  const channelId = ctx.source.channelId;
  const timestamp = Date.now();

  result.toolCalls.forEach((call) => {
    logger.info('Tool called: {toolName}', { toolName: call.toolName });
  });

  await Promise.all([
    ...result.toolCalls.map((call) =>
      RedisToolCallService.addToolCall({
        call: toToolCallPart(call),
        serverId,
        channelId,
        timestamp,
      }),
    ),
    ...result.toolResults.map((toolResult) =>
      RedisToolCallService.addToolResult({
        result: toToolResultPart(toolResult),
        serverId,
        channelId,
        timestamp,
      }),
    ),
  ]);

  ctx.messages.push(...result.response.messages);

  return { type: 'thinking' };
};
