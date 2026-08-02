import { getLogger } from '@logtape/logtape';
import { tool } from 'ai';
import type { Message } from 'discord.js';
import { findAttachments } from '../../clients/discord/utils';
import { ai } from '../../services/ai';
import type { ToolWithMeta } from '../../services/tools';
import { errorMessage } from '../../utils/error';
import { buildConversation } from './conversation';
import { PhoneMessageCache } from './message-cache';
import { buildSystemPrompt } from './prompt';
import { phoneInputSchema } from './schema';
import { getPhoneStrings, interpolate } from './strings';
import type { PhoneInput } from './types';

const logger = getLogger(['OpenBorys', 'tools', 'phone']);

const HISTORY_LENGTH = 5;

export function createPhoneTool(
  sourceMessage: Message,
): ToolWithMeta<PhoneInput, string> {
  const strings = getPhoneStrings();

  return {
    id: 'phone',
    name: strings.toolName,
    emoji: '📱',
    isAlwaysAvailable: true,
    formatArgs: (args) => `${args.contact}: ${args.message}`,
    execute: async ({ contact, message, imageIds = [] }) => {
      logger.info('Calling: {contact}', { contact });

      const cache = PhoneMessageCache.getInstance();
      const timestamp = Date.now();

      try {
        const imageUrls = await findAttachments(
          sourceMessage.channel,
          imageIds,
        );

        const messages = buildConversation({
          systemPrompt: buildSystemPrompt(strings, contact),
          history: cache.getLastMessages(contact, HISTORY_LENGTH),
          text: message,
          timestamp,
          imageUrls,
        });

        cache.push({
          sender: 'bot',
          contact,
          content: message,
          timestamp,
          imageUrls,
        });

        const response = await ai.generateTextRaw({ messages });
        const reply = response.text;

        cache.push({
          sender: 'contact',
          contact,
          content: reply,
          timestamp: Date.now(),
          imageUrls: [],
        });

        return reply;
      } catch (error) {
        const msg = errorMessage(error);
        logger.error('Phone call failed: {error}', { error: msg });
        return interpolate(strings.callFailed, { error: msg });
      }
    },
    tool: tool({
      description: strings.toolDescription,
      inputSchema: phoneInputSchema,
    }),
  };
}
