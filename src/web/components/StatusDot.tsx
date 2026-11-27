import clsx from 'clsx';

export type StatusTone = 'success' | 'error' | 'pending';

export function StatusDot({
  tone,
  label,
}: {
  tone: StatusTone;
  label: string;
}) {
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={clsx('size-2 shrink-0 rounded-full', {
        'bg-teal-400': tone === 'success',
        'bg-red-400': tone === 'error',
        'bg-zinc-500': tone === 'pending',
      })}
    />
  );
}
