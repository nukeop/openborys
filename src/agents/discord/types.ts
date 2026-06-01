import type {
  GenerateTextResult,
  ModelMessage,
  ToolCallPart,
  ToolSet,
} from 'ai';
import type { Message } from 'discord.js';

export type State =
  | 'message-received'
  | 'thinking'
  | 'tool-call'
  | 'executing-tool'
  | 'sending-message'
  | 'error';

export type AgentState = { type: State };

export type StateHandler = (ctx: RunContext) => Promise<AgentState | null>;

export type ReplyTrigger = 'mention' | 'decision';

export type RunContext = {
  messages: ModelMessage[];
  stepCount: number;
  source: Message;
  trigger: ReplyTrigger;
  lastResult: GenerateTextResult<ToolSet, never> | null;
  pendingToolCalls: ToolCallPart[];
  currentToolCall: ToolCallPart | null;
};
