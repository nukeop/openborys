import { getLogger } from '@logtape/logtape';
import { getDiscordContext } from '../../../clients/discord/context';
import type { StateHandler } from '../types';

const logger = getLogger([
  'OpenBorys',
  'Agent',
  'Discord',
  'EventHandlers',
  'MessageReceived',
]);

export const messageReceived: StateHandler = async (ctx) => {
  logger.debug('Handling message received event', {
    messageId: ctx.source.id,
    channelId: ctx.source.channelId,
    guildId: ctx.source.guildId,
  });
  const { systemPrompt, context } = await getDiscordContext(
    ctx.source,
    ctx.trigger === 'decision',
  );
  ctx.messages = [{ role: 'system', content: systemPrompt }, ...context];

  return { type: 'thinking' };
};
