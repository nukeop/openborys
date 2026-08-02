import clsx from 'clsx';
import type { PhoneMessage } from '../../tools/phone/message-cache';
import { BubbleImage } from './BubbleImage';

const timestampFormat = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
});

const exactTimeFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function ChatBubble({ message }: { message: PhoneMessage }) {
  const isBot = message.sender === 'bot';

  return (
    <div
      className={clsx('flex', {
        'justify-end': isBot,
        'justify-start': !isBot,
      })}
    >
      <div
        className={clsx('flex max-w-[70%] flex-col gap-1', {
          'items-end': isBot,
          'items-start': !isBot,
        })}
      >
        {message.imageUrls.map((url) => (
          <BubbleImage key={url} url={url} />
        ))}
        <div
          title={exactTimeFormat.format(message.timestamp)}
          className={clsx('rounded-2xl px-4 py-2 text-sm leading-relaxed', {
            'rounded-br-sm bg-teal-700 text-teal-50': isBot,
            'rounded-bl-sm bg-zinc-700 text-zinc-100': !isBot,
          })}
        >
          {message.content}
        </div>
        <span className="px-1 text-xs text-zinc-500">
          {timestampFormat.format(message.timestamp)}
        </span>
      </div>
    </div>
  );
}
