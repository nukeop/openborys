import { getLogger } from '@logtape/logtape';
import type { Message } from 'discord.js';
import { ai } from '../../../services/ai';
import { StringsService } from '../../../services/strings';
import { errorMessage } from '../../../utils/error';
import { getDiscordContext } from '../context';
import { ReplyDecisionCooldown } from './cooldown';
import { replyDecisionSchema } from './schema';
import { type ReplyDecision, ReplyDecisionStore } from './store';

const logger = getLogger(['OpenBorys', 'Discord', 'ReplyDecision']);

const cooldown = new ReplyDecisionCooldown();

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

const decideWithAI = async (
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
    signal,
  );

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

export const cancelPendingDecision = (channelId: string): void => {
  cooldown.abort(channelId);
};

export const decideReply = async (message: Message): Promise<boolean> => {
  try {
    const result = await cooldown.run(message.channelId, (signal) =>
      decideWithAI(message, signal),
    );
    return result.status === 'completed' && result.value;
  } catch (error) {
    const cause = error instanceof Error && 'cause' in error ? error.cause : undefined;
    logger.error('Reply decision failed: {message} {cause}', {
      message: errorMessage(error),
      cause: cause ? JSON.stringify(cause, null, 2) : 'no cause',
    });
    return false;
  }
};
