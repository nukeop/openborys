import clsx from 'clsx';

export function ToolPill({
  emoji,
  label,
  alwaysAvailable,
  failed,
  muted,
  small,
}: {
  emoji?: string;
  label: string;
  alwaysAvailable?: boolean;
  failed?: boolean;
  muted?: boolean;
  small?: boolean;
}) {
  return (
    <span
      title={label}
      className={clsx(
        'inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-md border bg-zinc-800/60',
        {
          'px-2 py-0.5 text-xs': small,
          'px-2.5 py-1 text-sm': !small,
          'border-teal-700/60': alwaysAvailable,
          'border-red-500/50': failed,
          'border-zinc-700': !alwaysAvailable && !failed,
          'text-zinc-500': muted,
          'text-zinc-300': !muted,
        },
      )}
    >
      {alwaysAvailable && (
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
      )}
      {emoji && <span className="shrink-0">{emoji}</span>}
      <span className="truncate">{label}</span>
    </span>
  );
}
