import { messageReceived } from './handlers/message-received';
import type { AgentState, RunContext, State, StateHandler } from './types';

const handlers: Record<State, StateHandler> = {
  'message-received': messageReceived,
  thinking: async (_ctx) => {
    return null;
  },
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

export const runAgent = async (
  state: AgentState,
  ctx: RunContext,
): Promise<void> => {
  const next = await handlers[state.type](ctx);

  if (!next) {
    return;
  }

  return runAgent(next, ctx);
};
