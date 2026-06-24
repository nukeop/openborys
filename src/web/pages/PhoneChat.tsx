import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'wouter';
import { CardSkeleton } from '../components/CardSkeleton';
import { ChatBubble } from '../components/ChatBubble';
import { phoneConversationQuery } from '../queries/phone-conversation';

export function PhoneChat() {
  const params = useParams<{ contact: string }>();
  const contact = decodeURIComponent(params.contact ?? '');
  const { data, isPending } = useQuery(phoneConversationQuery(contact));

  if (isPending || !data) {
    return (
      <div className="mx-auto max-w-2xl p-8">
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col p-8">
      <title>{contact}</title>
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-teal-400"
      >
        &larr; Back
      </Link>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900">
        <div className="border-zinc-800 border-b px-6 py-4">
          <h1 className="font-semibold text-lg text-zinc-100">{contact}</h1>
        </div>

        <div className="flex flex-col gap-3 p-6">
          {data.length === 0 ? (
            <p className="text-center text-sm text-zinc-500">No messages</p>
          ) : (
            data.map((message) => (
              <ChatBubble
                key={`${message.sender}-${message.timestamp}`}
                message={message}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
