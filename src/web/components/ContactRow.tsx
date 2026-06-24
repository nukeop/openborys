import { Link } from 'wouter';
import type { PhoneMessage } from '../../tools/phone/message-cache';

const timestampFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'short',
  timeStyle: 'short',
});

function ContactInitial({ name }: { name: string }) {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-zinc-700 font-semibold text-sm text-zinc-300">
      {name[0]!.toUpperCase()}
    </div>
  );
}

export function ContactRow({ message }: { message: PhoneMessage }) {
  return (
    <Link
      to={`/phone/${encodeURIComponent(message.contact)}`}
      className="flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-zinc-800/50"
    >
      <ContactInitial name={message.contact} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-medium text-sm text-zinc-200">
            {message.contact}
          </span>
          <span className="shrink-0 text-xs text-zinc-500">
            {timestampFormat.format(message.timestamp)}
          </span>
        </div>
        <p className="truncate text-sm text-zinc-500">{message.content}</p>
      </div>
    </Link>
  );
}
