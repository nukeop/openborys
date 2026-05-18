import { getLogger } from '@logtape/logtape';
import { EmbedBuilder } from 'discord.js';
import { RedisToolCallService } from '../../../services/redis-tool-calls';
import { ScopedToolService } from '../../../services/scoped-tools';
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
