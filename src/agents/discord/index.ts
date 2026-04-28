import { getLogger } from '@logtape/logtape';
import type { Message } from 'discord.js';
import { messageReceived } from './handlers/message-received';
import { thinking } from './handlers/thinking';
import type { AgentState, RunContext, State, StateHandler } from './types';

const logger = getLogger(['OpenBorys', 'Agent', 'Discord']);

const handlers: Record<State, StateHandler> = {
  'message-received': messageReceived,
  thinking,
  'tool-call': async (_ctx) => {
    return null;
  },
  'sending-message': async (_ctx) => {
    return null;
  },
  error: async (_ctx) => {
    return null;
  },
};

const run = async (state: AgentState, ctx: RunContext): Promise<void> => {
  const next = await handlers[state.type](ctx);

  if (!next) {
    return;
  }

  return run(next, ctx);
};

export const runAgent = async (source: Message): Promise<void> => {
  logger.debug('Starting Discord agent run');

  const ctx: RunContext = {
    messages: [],
    stepCount: 0,
    source,
    lastResult: null,
  };

  return run({ type: 'message-received' }, ctx);
};
