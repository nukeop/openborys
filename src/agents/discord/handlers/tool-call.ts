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

export const toolCall: StateHandler = async (ctx) => {
  const call = ctx.pendingToolCalls.shift()!;

  logger.info('Tool called: {toolName}', { toolName: call.toolName });

  const tool = ToolService.findByIdOrName(call.toolName)!;

  if (ctx.source.channel.isSendable()) {
    const formattedArgs = tool.formatArgs(call.input as never);
    const embed = new EmbedBuilder().setDescription(
      `${tool.emoji} **${tool.name}**\n${formattedArgs}`,
    );
    await ctx.source.channel.send({ embeds: [embed] });
  }

  const serverId = ctx.source.guildId ?? 'dm';
  const channelId = ctx.source.channelId;
  const timestamp = Date.now();

  await RedisToolCallService.addToolCall({
    call,
    serverId,
    channelId,
    timestamp,
  });

  ctx.currentToolCall = call;

  return { type: 'executing-tool' };
};
