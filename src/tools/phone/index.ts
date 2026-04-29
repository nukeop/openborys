import { getLogger } from '@logtape/logtape';
import type { ModelMessage } from 'ai';
import { tool } from 'ai';
import { env } from '../../environment';
import { FriendsService } from '../../friends';
import { ai } from '../../services/ai';
import { StringsService } from '../../services/strings';
import type { ToolWithMeta } from '../../services/tools';
import { PhoneMessageCache } from './message-cache';
import { phoneInputSchema } from './schema';
import type { PhoneInput } from './types';

const logger = getLogger(['OpenBorys', 'tools', 'phone']);

export type PhoneStrings = {
  toolName: string;
  toolDescription: string;
  systemPrompt: string;
  callFailed: string;
};

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(
    /\{(\w+)\}/g,
    (match, key: string) => vars[key] ?? match,
  );
}

function extractContactNames(contact: string): string[] {
  return contact
    .split(/\s+i\s+|,\s*/)
    .map((name) => name.trim())
    .filter((name) => name.length > 0);
}

export function createPhoneTool(): ToolWithMeta<PhoneInput, string> {
  const strings = StringsService.get('phone') as PhoneStrings;

  const buildSystemPrompt = (
    contact: string,
    descriptions: string[],
  ): string => {
    const descriptionsText =
      descriptions.length > 0 ? descriptions.join('\n') : '';
    return interpolate(strings.systemPrompt, {
      botName: env().BOT_NAME,
      contact,
      descriptions: descriptionsText,
    });
  };

  return {
    id: 'phone',
    name: strings.toolName,
    emoji: '📱',
    isAlwaysAvailable: true,
    formatArgs: (args) => `${args.contact}: ${args.message}`,
    execute: async ({ contact, message }) => {
      logger.info('Calling: {contact}', { contact });

      const timestamp = new Date().toLocaleString(undefined, {
        timeZone: env().TZ,
      });
      const timestampedMessage = `[${timestamp}] ${message}`;

      const names = extractContactNames(contact);
      const descriptions = names
        .map((name) => {
          const friend = FriendsService.findByName(name);
          return friend ? `${friend.name}: ${friend.description}` : null;
        })
        .filter((desc): desc is string => desc !== null);

      const cache = PhoneMessageCache.getInstance();
      const history = cache.getLastMessages(contact, 5);

      const messages: ModelMessage[] = [
        {
          role: 'system',
          content: buildSystemPrompt(contact, descriptions),
        },
        ...history.map((msg) => ({
          role: (msg.sender === 'bot' ? 'user' : 'assistant') as
            | 'user'
            | 'assistant',
          content: msg.content,
        })),
        {
          role: 'user',
          content: timestampedMessage,
        },
      ];

      cache.push(contact, { sender: 'bot', content: timestampedMessage });

      try {
        const response = await ai.generateTextRaw({ messages });
        const result = response.text;

        cache.push(contact, { sender: 'contact', content: result });

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error('Phone call failed: {error}', { error: errorMessage });
        return interpolate(strings.callFailed, { error: errorMessage });
      }
    },
    tool: tool({
      description: strings.toolDescription,
      inputSchema: phoneInputSchema,
    }),
  };
}
