import { useRef } from 'react';
import type { PhoneMessage } from '../../../tools/phone/message-cache';
import { CardSkeleton } from '../CardSkeleton';
import { ConversationHeader } from './ConversationHeader';
import { MessageList } from './MessageList';
import { useStickToBottom } from './use-stick-to-bottom';

function ConversationBody({
  messages,
}: {
  messages: PhoneMessage[] | undefined;
}) {
  if (!messages) {
    return <CardSkeleton />;
  }
  if (messages.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-500">No messages</p>
    );
  }
  return <MessageList messages={messages} />;
}

/**
 * The messaging app screen. The header stays pinned while the messages
 * scroll underneath it.
 */
export function PhoneConversation({
  contact,
  messages,
}: {
  contact: string;
  messages: PhoneMessage[] | undefined;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  useStickToBottom(scrollRef, contentRef, messages);

  return (
    <div
      ref={scrollRef}
      className="flex h-full flex-col overflow-y-auto overscroll-contain [scrollbar-width:none]"
    >
      <ConversationHeader contact={contact} />
      <div ref={contentRef} className="flex-1 px-4 pt-2 pb-4">
        <ConversationBody messages={messages} />
      </div>
    </div>
  );
}
