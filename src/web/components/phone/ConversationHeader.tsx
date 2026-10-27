import { IoChevronBack } from 'react-icons/io5';
import { Link } from 'wouter';

function ContactAvatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <span
      aria-hidden="true"
      className="flex size-12 items-center justify-center rounded-full bg-linear-to-b from-zinc-500 to-zinc-700 font-semibold text-white text-xl"
    >
      {initial}
    </span>
  );
}

export function ConversationHeader({ contact }: { contact: string }) {
  return (
    <header className="sticky top-0 z-20 grid grid-cols-[1fr_auto_1fr] items-start border-zinc-800/80 border-b bg-zinc-950/75 px-2 pt-2 pb-2 backdrop-blur-xl sm:pt-[54px]">
      <Link
        to="/"
        aria-label="Back to dashboard"
        className="mt-3 flex size-9 items-center justify-center justify-self-start rounded-full text-teal-400 transition-colors hover:text-teal-300 focus-visible:outline-2 focus-visible:outline-teal-400 active:text-teal-500"
      >
        <IoChevronBack className="size-7" aria-hidden="true" />
      </Link>
      <div className="flex min-w-0 max-w-48 flex-col items-center gap-1">
        <ContactAvatar name={contact} />
        <h1 className="max-w-full truncate font-medium text-xs text-zinc-100">
          {contact}
        </h1>
      </div>
    </header>
  );
}
