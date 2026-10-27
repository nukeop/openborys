import { useEffect, useState } from 'react';

const MINUTE_MS = 60 * 1000;

/** Current time, refreshed at the start of every minute. */
export function useCurrentTime() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const scheduleNextTick = () => {
      const untilNextMinute = MINUTE_MS - (Date.now() % MINUTE_MS);
      timeout = setTimeout(() => {
        setNow(Date.now());
        scheduleNextTick();
      }, untilNextMinute);
    };

    scheduleNextTick();
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return now;
}
