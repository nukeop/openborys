import { IoBatteryFull, IoCellular, IoWifi } from 'react-icons/io5';
import { formatClock } from './time-format';
import { useCurrentTime } from './use-current-time';

export function StatusBar() {
  const now = useCurrentTime();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-30 flex h-[54px] items-center justify-between pr-7 pl-9 text-zinc-100"
    >
      <span className="font-semibold text-[15px] tabular-nums tracking-tight">
        {formatClock(now)}
      </span>
      <span className="flex items-center gap-1.5">
        <IoCellular className="size-4" />
        <IoWifi className="size-4" />
        <IoBatteryFull className="size-6" />
      </span>
    </div>
  );
}
