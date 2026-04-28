import { getLogger } from '@logtape/logtape';
import { ai } from '../../../services/ai';
import type { StateHandler } from '../types';

const logger = getLogger([
  'OpenBorys',
  'Agent',
  'Discord',
  'EventHandlers',
  'Thinking',
]);

export const thinking: StateHandler = async (ctx) => {
  const result = await ai.generateText({ messages: ctx.messages });
  ctx.lastResult = result;

  if (result.finishReason === 'stop') {
    return { type: 'sending-message' };
  }

  if (result.finishReason === 'tool-calls') {
    return { type: 'tool-call' };
  }

  logger.error('Unexpected finish reason: {finishReason}', {
    finishReason: result.finishReason,
  });
  return { type: 'error' };
};
