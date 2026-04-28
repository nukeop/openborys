import { getDiscordContext } from '../../../clients/discord/context';
import type { StateHandler } from '../types';

export const messageReceived: StateHandler = async (ctx) => {
  const { systemPrompt, context } = await getDiscordContext(ctx.source);
  ctx.messages = [{ role: 'system', content: systemPrompt }, ...context];

  return { type: 'thinking' };
};
