import type { GenerateTextResult, ModelMessage, ToolSet } from 'ai';
import type { Message } from 'discord.js';

export type State =
  | 'message-received'
  | 'thinking'
  | 'tool-call'
  | 'sending-message'
  | 'error';

export type AgentState = { type: State };

export type StateHandler = (ctx: RunContext) => Promise<AgentState | null>;

export type RunContext = {
  messages: ModelMessage[];
  stepCount: number;
  source: Message;
  lastResult: GenerateTextResult<ToolSet, never> | null;
};
