import { getLogger } from '@logtape/logtape';
import type { Message } from 'discord.js';
import { ai } from '../../../services/ai';
import { StringsService } from '../../../services/strings';
import { getDiscordContext } from '../context';
import { replyDecisionSchema } from './schema';
import { type ReplyDecision, ReplyDecisionStore } from './store';

const logger = getLogger(['OpenBorys', 'Discord', 'ReplyDecision']);

type ReplyDecisionStrings = {
  instruction: string;
  previousDecision: string;
  noPreviousDecision: string;
  reply: string;
  skip: string;
};

const buildPreviousDecisionLine = (
  strings: ReplyDecisionStrings,
  previous: ReplyDecision | undefined,
): string => {
  if (!previous) {
    return strings.noPreviousDecision;
  }

  const decisionWord = previous.shouldReply ? strings.reply : strings.skip;
  return strings.previousDecision
    .replace('{decision}', decisionWord)
    .replace('{reason}', previous.reason);
};

export const shouldAIReply = async (
  message: Message,
  signal: AbortSignal,
): Promise<boolean> => {
  const strings = StringsService.get('reply-decision') as ReplyDecisionStrings;
  const { systemPrompt, context } = await getDiscordContext(message);
  const previous = ReplyDecisionStore.getLatest(message.channelId);

  const decisionPrompt = [
    systemPrompt,
    strings.instruction,
    buildPreviousDecisionLine(strings, previous),
  ].join('\n\n');

  const result = await ai.generateCheapObject(
    [{ role: 'system', content: decisionPrompt }, ...context],
    replyDecisionSchema,
  );

  if (signal.aborted) {
    return false;
  }

  logger.info('AI reply decision: {decision} - {reason}', {
    decision: result.shouldReply ? 'reply' : 'skip',
    reason: result.reason,
  });

  ReplyDecisionStore.record(message.channelId, {
    shouldReply: result.shouldReply,
    reason: result.reason,
    timestamp: Date.now(),
  });

  return result.shouldReply;
};
