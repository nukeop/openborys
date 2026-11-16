import { getLogger } from '@logtape/logtape';
import type { Message } from 'discord.js';
import { z } from 'zod';
import { env } from '../../../environment';
import { StringsService } from '../../../services/strings';
import { errorMessage } from '../../../utils/error';

const responseSchema = z.object({
  answers: z.object({
    finished: z.object({ noul: z.number() }),
  }),
});

const logger = getLogger(['OpenBorys', 'Discord', 'ReplyDecision']);

type DrexStrings = {
  drexFinishedInstruction: string;
  drexFinishedTrue: string;
  drexFinishedFalse: string;
};

type ChatLogEntry = {
  timestamp: number;
  author: string;
  content: string;
};

export class Drex {
  private constructor() {}

  static isThoughtFinished = async (
    message: Message,
    signal: AbortSignal,
  ): Promise<boolean> => {
    try {
      const recent = await message.channel.messages.fetch({
        limit: 20,
      });
      const chatLog = Drex.#formatChatLog(recent.map(Drex.#toChatLogEntry));
      const noul = await Drex.#fetchFinishedProbability(chatLog, signal);

      logger.info('Thought finished probability: {noul}', { noul });
      return noul >= 0.5;
    } catch (error) {
      if (signal.aborted) {
        throw error;
      }
      logger.warn(
        'Decision model check failed, falling back to AI: {message}',
        { message: errorMessage(error) },
      );
      return true;
    }
  };

  static #formatChatLog = (entries: ChatLogEntry[]): string =>
    entries
      .toSorted((a, b) => a.timestamp - b.timestamp)
      .map(({ timestamp, author, content }) => {
        const time = new Date(timestamp).toLocaleTimeString('pl-PL', {
          timeZone: 'Europe/Warsaw',
        });
        return `[${time}] ${author}: ${content}`;
      })
      .join('\n');

  static #toChatLogEntry = (message: Message): ChatLogEntry => ({
    timestamp: message.createdTimestamp,
    author: message.member?.displayName ?? message.author.displayName,
    content: message.cleanContent,
  });

  static #fetchFinishedProbability = async (
    chatLog: string,
    signal: AbortSignal,
  ): Promise<number> => {
    const strings = StringsService.get('reply-decision') as DrexStrings;

    const response = await fetch('https://openrouter.ai/api/alpha/decisions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env().OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'nace-ai/drex-max',
        state: chatLog,
        questions: {
          finished: {
            type: 'noul',
            instructions: strings.drexFinishedInstruction,
            criteria: {
              true: strings.drexFinishedTrue,
              false: strings.drexFinishedFalse,
            },
          },
        },
      }),
      signal,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `OpenRouter decision failed with status ${response.status}: ${body}`,
      );
    }

    const parsed = responseSchema.parse(await response.json());
    return parsed.answers.finished.noul;
  };
}
