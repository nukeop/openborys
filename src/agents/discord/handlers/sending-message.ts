import { getLogger } from '@logtape/logtape';
import type { StateHandler } from '../types';

const logger = getLogger([
  'OpenBorys',
  'Agent',
  'Discord',
  'EventHandlers',
  'SendingMessage',
]);

export const sendingMessage: StateHandler = async (ctx) => {
  const text = ctx.lastResult?.text ?? '';

  if (text && ctx.source.channel.isSendable()) {
    logger.debug('Sending message)');
    await ctx.source.channel.send(text);
  } else {
    logger.warn('No text to send, skipping');
  }

  return null;
};
