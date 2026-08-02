import { env } from '../../environment';
import { FriendsService } from '../../friends';
import { interpolate, type PhoneStrings } from './strings';

function extractContactNames(contact: string): string[] {
  return contact
    .split(/\s+i\s+|,\s*/)
    .map((name) => name.trim())
    .filter((name) => name.length > 0);
}

function describeContact(name: string): string[] {
  const friend = FriendsService.findByName(name);
  if (!friend) {
    return [];
  }
  return [`${friend.name}: ${friend.description}`];
}

export function buildSystemPrompt(
  strings: PhoneStrings,
  contact: string,
): string {
  const descriptions = extractContactNames(contact).flatMap(describeContact);
  return interpolate(strings.systemPrompt, {
    botName: env().BOT_NAME,
    contact,
    descriptions: descriptions.join('\n'),
  });
}
