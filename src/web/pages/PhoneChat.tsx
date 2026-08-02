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
      <div className="mx-auto max-w-2xl p-4 sm:p-8">
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col sm:min-h-0 sm:p-8">
      <title>{contact}</title>

      <div className="flex flex-1 flex-col bg-zinc-900 sm:flex-none sm:rounded-lg sm:border sm:border-zinc-800">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-zinc-800 border-b bg-zinc-900/90 px-4 py-3 backdrop-blur sm:static sm:bg-zinc-900 sm:px-6 sm:py-4">
          <Link
            to="/"
            aria-label="Back"
            className="text-lg text-zinc-500 transition-colors hover:text-teal-400"
          >
            &larr;
          </Link>
          <h1 className="font-semibold text-lg text-zinc-100">{contact}</h1>
        </header>

        <div className="flex flex-1 flex-col gap-3 p-4 sm:flex-none sm:p-6">
          {data.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              No messages
            </p>
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
