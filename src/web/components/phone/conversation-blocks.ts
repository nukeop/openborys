import type { PhoneMessage } from '../../../tools/phone/message-cache';

const SEPARATOR_GAP_MS = 60 * 60 * 1000;

export type TimeSeparatorBlock = {
  kind: 'separator';
  timestamp: number;
};

export type MessageGroupBlock = {
  kind: 'group';
  sender: PhoneMessage['sender'];
  startedAt: number;
  messages: PhoneMessage[];
};

export type ConversationBlock = TimeSeparatorBlock | MessageGroupBlock;

function isSameDay(a: number, b: number) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

function needsSeparator(
  previous: PhoneMessage | undefined,
  next: PhoneMessage,
) {
  if (!previous) {
    return true;
  }
  if (!isSameDay(previous.timestamp, next.timestamp)) {
    return true;
  }
  return next.timestamp - previous.timestamp > SEPARATOR_GAP_MS;
}

/**
 * Splits a conversation into time separators and runs of consecutive
 * messages from one sender. A separator always ends the current run.
 */
export function buildConversationBlocks(
  messages: PhoneMessage[],
): ConversationBlock[] {
  const blocks: ConversationBlock[] = [];
  let currentGroup: MessageGroupBlock | undefined;
  let previous: PhoneMessage | undefined;

  for (const message of messages) {
    if (needsSeparator(previous, message)) {
      blocks.push({ kind: 'separator', timestamp: message.timestamp });
      currentGroup = undefined;
    }

    if (currentGroup?.sender === message.sender) {
      currentGroup.messages.push(message);
    } else {
      currentGroup = {
        kind: 'group',
        sender: message.sender,
        startedAt: message.timestamp,
        messages: [message],
      };
      blocks.push(currentGroup);
    }

    previous = message;
  }

  return blocks;
}
