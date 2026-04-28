import type { Message } from 'discord.js';

type State =
  | 'message-received'
  | 'thinking'
  | 'tool-call'
  | 'sending-message'
  | 'error';

type AgentState = { type: State };

type StateHandler = (ctx: RunContext) => Promise<AgentState | null>;

type RunContext = {
  messages: [];
  stepCount: number;
  source: Message;
};

const handlers: Record<State, StateHandler> = {
  'message-received': async (_ctx) => {
    return null;
  },
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
