import { getLogger } from '@logtape/logtape';
import { ai } from '../../../services/ai';
import { ScopedToolService } from '../../../services/scoped-tools';
import type { StateHandler } from '../types';

const logger = getLogger([
  'OpenBorys',
  'Agent',
  'Discord',
  'EventHandlers',
  'Thinking',
]);

export const thinking: StateHandler = async (ctx) => {
  const result = await ai.generateText(
    { messages: ctx.messages },
    ScopedToolService.getToolsForScope(ctx.source.id),
  );
  ctx.lastResult = result;

  if (result.finishReason === 'stop') {
    return { type: 'sending-message' };
  }

  if (result.finishReason === 'tool-calls') {
    ctx.pendingToolCalls = result.toolCalls.map((call) => ({
      type: 'tool-call' as const,
      toolCallId: call.toolCallId,
      toolName: call.toolName,
      input: call.input,
    }));
    ctx.messages.push(...result.response.messages);
    return { type: 'tool-call' };
  }

  logger.error('Unexpected finish reason: {finishReason}', {
    finishReason: result.finishReason,
  });
  return { type: 'error' };
};
