import { getLogger } from '@logtape/logtape';
import type { Message } from 'discord.js';
import { error } from './handlers/error';
import { messageReceived } from './handlers/message-received';
import { sendingMessage } from './handlers/sending-message';
import { thinking } from './handlers/thinking';
import { toolCall } from './handlers/tool-call';
import type { AgentState, RunContext, State, StateHandler } from './types';

const logger = getLogger(['OpenBorys', 'Agent', 'Discord']);

const handlers: Record<State, StateHandler> = {
  'message-received': messageReceived,
  thinking,
  'tool-call': toolCall,
  'sending-message': sendingMessage,
  error,
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
