import clsx from 'clsx';
import type { PhoneMessage } from '../../../tools/phone/message-cache';
import { BubbleImage } from '../BubbleImage';
import { BubbleTail } from './BubbleTail';
import { formatExactTime } from './time-format';

type Sender = PhoneMessage['sender'];

// The bot owns the phone, so its messages sit on the right.
const SIDE: Record<Sender, 'left' | 'right'> = {
  bot: 'right',
  contact: 'left',
};

const BUBBLE_COLORS: Record<Sender, string> = {
  bot: 'bg-teal-700 text-teal-50',
  contact: 'bg-zinc-800 text-zinc-100',
};

const TAIL_COLORS: Record<Sender, string> = {
  bot: 'text-teal-700',
  contact: 'text-zinc-800',
};

function TextBubble({
  content,
  sender,
  hasTail,
}: {
  content: string;
  sender: Sender;
  hasTail: boolean;
}) {
  return (
    <div
      className={clsx(
        'relative whitespace-pre-wrap break-words rounded-[18px] px-3.5 py-[7px] text-[15px] leading-snug',
        BUBBLE_COLORS[sender],
      )}
    >
      {content}
      {hasTail && (
        <BubbleTail side={SIDE[sender]} className={TAIL_COLORS[sender]} />
      )}
    </div>
  );
}

export function MessageBubble({
  message,
  hasTail,
}: {
  message: PhoneMessage;
  hasTail: boolean;
}) {
  const side = SIDE[message.sender];
  const hasText = message.content.trim().length > 0;

  return (
    <div
      title={formatExactTime(message.timestamp)}
      className={clsx('flex max-w-[78%] flex-col gap-0.5', {
        'items-end self-end': side === 'right',
        'items-start self-start': side === 'left',
      })}
    >
      {message.imageUrls.map((url) => (
        <BubbleImage key={url} url={url} />
      ))}
      {hasText && (
        <TextBubble
          content={message.content}
          sender={message.sender}
          hasTail={hasTail}
        />
      )}
    </div>
  );
}
