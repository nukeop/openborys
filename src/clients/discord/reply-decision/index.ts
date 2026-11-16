import { getLogger } from '@logtape/logtape';
import type { Message } from 'discord.js';
import { errorMessage } from '../../../utils/error';
import { decideWithAI } from './ai-decision';
import { ReplyDecisionCooldown } from './cooldown';
import { Drex } from './drex';
import { TypingTracker } from './typing-tracker';

const logger = getLogger(['OpenBorys', 'Discord', 'ReplyDecision']);

export class ReplyDecider {
  static #typing = new TypingTracker();
  static #cooldown = new ReplyDecisionCooldown(ReplyDecider.#typing);

  private constructor() {}

  static decide = async (message: Message): Promise<boolean> => {
    ReplyDecider.#forgetAuthorTyping(message);

    try {
      const result = await ReplyDecider.#cooldown.run(
        message.channelId,
        async (signal) => {
          const finished = await Drex.isThoughtFinished(message, signal);
          if (!finished) {
            return false;
          }
          return decideWithAI(message, signal);
        },
      );
      return result.status === 'completed' && result.value;
    } catch (error) {
      logger.error('Reply decision failed: {message}', {
        message: errorMessage(error),
      });
      return false;
    }
  };

  static cancel = (message: Message): void => {
    ReplyDecider.#forgetAuthorTyping(message);
    ReplyDecider.#cooldown.abort(message.channelId);
  };

  static recordTyping = (channelId: string, userId: string): void => {
    ReplyDecider.#typing.record(channelId, userId);
  };

  static #forgetAuthorTyping = (message: Message): void => {
    ReplyDecider.#typing.forget(message.channelId, message.author.id);
  };
}
