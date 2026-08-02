import type { ModelMessage, UserContent } from 'ai';
import { env } from '../../environment';
import type { PhoneMessage } from './message-cache';

export function timestampMessage(message: string): string {
  const timestamp = new Date().toLocaleString(undefined, {
    timeZone: env().TZ,
  });
  return `[${timestamp}] ${message}`;
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
    return { role: 'user', content: message.content };
  }
  return { role: 'assistant', content: message.content };
}

export function buildConversation(args: {
  systemPrompt: string;
  history: PhoneMessage[];
  text: string;
  imageUrls: string[];
}): ModelMessage[] {
  return [
    { role: 'system', content: args.systemPrompt },
    ...args.history.map(toHistoryMessage),
    { role: 'user', content: buildUserContent(args.text, args.imageUrls) },
  ];
}
