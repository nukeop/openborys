import type { PhoneMessage } from '../../tools/phone/message-cache';

const timestampFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'short',
  timeStyle: 'short',
});

export function ContactRow({ message }: { message: PhoneMessage }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-zinc-800 bg-zinc-800/40 px-4 py-3">
      <span className="font-medium text-sm text-zinc-300">
        {message.contact}
      </span>
      <span className="ml-auto shrink-0 font-mono text-xs text-zinc-500">
        {timestampFormat.format(message.timestamp)}
      </span>
    </div>
  );
}
