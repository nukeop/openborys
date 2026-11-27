import clsx from 'clsx';

export function Stat({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="font-mono text-xs text-zinc-500 uppercase tracking-wider">
        {label}
      </span>
      <span
        title={value}
        className={clsx('text-sm text-zinc-100', {
          'truncate font-mono': mono,
        })}
      >
        {value}
      </span>
    </div>
  );
}
