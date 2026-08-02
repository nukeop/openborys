import type { ModelMessage, UserContent } from 'ai';
import { env } from '../../environment';
import type { PhoneMessage } from './message-cache';

function withTimestamp(content: string, timestamp: number): string {
  const formatted = new Date(timestamp).toLocaleString(undefined, {
    timeZone: env().TZ,
  });
  return `[${formatted}] ${content}`;
}

function buildUserContent(text: string, imageUrls: string[]): UserContent {
  if (imageUrls.length === 0) {
    return text;
  }

  return [
    { type: 'text' as const, text },
    ...imageUrls.map((url) => ({ type: 'image' as const, image: url })),
  ];
}

function toHistoryMessage(message: PhoneMessage): ModelMessage {
  if (message.sender === 'bot') {
    return {
      role: 'user',
      content: withTimestamp(message.content, message.timestamp),
    };
  }
  return { role: 'assistant', content: message.content };
}

export function buildConversation(args: {
  systemPrompt: string;
  history: PhoneMessage[];
  text: string;
  timestamp: number;
  imageUrls: string[];
}): ModelMessage[] {
  const outgoing = withTimestamp(args.text, args.timestamp);
  return [
    { role: 'system', content: args.systemPrompt },
    ...args.history.map(toHistoryMessage),
    { role: 'user', content: buildUserContent(outgoing, args.imageUrls) },
  ];
}
