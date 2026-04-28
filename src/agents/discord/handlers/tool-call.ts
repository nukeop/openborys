import type { JSONValue, ToolCallPart, ToolResultPart } from 'ai';
import { getLogger } from '@logtape/logtape';
import { EmbedBuilder } from 'discord.js';
import { RedisToolCallService } from '../../../services/redis-tool-calls';
import { ToolService } from '../../../services/tools';
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

  const embedPromises = result.toolCalls.flatMap((call) => {
    logger.info('Tool called: {toolName}', { toolName: call.toolName });

    const tool = ToolService.findByIdOrName(call.toolName);
    if (!tool || !ctx.source.channel.isSendable()) {
      return [];
    }

    const formattedArgs = tool.formatArgs(call.input as never);

    const embed = new EmbedBuilder().setDescription(
      `${tool.emoji} **${tool.name}**\n${formattedArgs}`,
    );

    return [ctx.source.channel.send({ embeds: [embed] })];
  });

  await Promise.all([
    Promise.all(embedPromises),
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
