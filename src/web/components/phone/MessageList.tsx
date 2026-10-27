import type { PhoneMessage } from '../../../tools/phone/message-cache';
import {
  buildConversationBlocks,
  type ConversationBlock,
  type MessageGroupBlock,
} from './conversation-blocks';
import { MessageBubble } from './MessageBubble';
import { TimeSeparator } from './TimeSeparator';
import { useCurrentTime } from './use-current-time';

function MessageGroup({ group }: { group: MessageGroupBlock }) {
  const lastIndex = group.messages.length - 1;

  return (
    <div className="flex flex-col gap-0.5">
      {group.messages.map((message, index) => (
        <MessageBubble
          key={`${message.sender}-${message.timestamp}`}
          message={message}
          hasTail={index === lastIndex}
        />
      ))}
    </div>
  );
}

function blockKey(block: ConversationBlock) {
  if (block.kind === 'separator') {
    return `separator-${block.timestamp}`;
  }
  return `group-${block.sender}-${block.startedAt}`;
}

export function MessageList({ messages }: { messages: PhoneMessage[] }) {
  const now = useCurrentTime();
  const blocks = buildConversationBlocks(messages);

  return (
    <div className="flex flex-col gap-2.5">
      {blocks.map((block) => {
        if (block.kind === 'separator') {
          return (
            <TimeSeparator
              key={blockKey(block)}
              timestamp={block.timestamp}
              now={now}
            />
          );
        }
        return <MessageGroup key={blockKey(block)} group={block} />;
      })}
    </div>
  );
}
