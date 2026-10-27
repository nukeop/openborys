import { formatClock, formatSeparatorDay } from './time-format';

export function TimeSeparator({
  timestamp,
  now,
}: {
  timestamp: number;
  now: number;
}) {
  return (
    <p className="pt-3 pb-1 text-center text-[11px] text-zinc-400">
      <span className="font-semibold text-zinc-300">
        {formatSeparatorDay(timestamp, now)}
      </span>{' '}
      <time dateTime={new Date(timestamp).toISOString()}>
        {formatClock(timestamp)}
      </time>
    </p>
  );
}
