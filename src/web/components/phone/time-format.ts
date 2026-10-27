const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAY_WINDOW_DAYS = 6;

const clockFormat = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
});

const weekdayFormat = new Intl.DateTimeFormat(undefined, { weekday: 'long' });

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

const exactTimeFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function startOfDay(timestamp: number) {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function daysBetween(earlier: number, later: number) {
  return Math.round((startOfDay(later) - startOfDay(earlier)) / DAY_MS);
}

export function formatClock(timestamp: number) {
  return clockFormat.format(timestamp);
}

export function formatExactTime(timestamp: number) {
  return exactTimeFormat.format(timestamp);
}

/** Day label in the style of a phone messaging app: Today, Yesterday, a weekday, or a date. */
export function formatSeparatorDay(timestamp: number, now: number) {
  const daysAgo = daysBetween(timestamp, now);

  if (daysAgo === 0) {
    return 'Today';
  }
  if (daysAgo === 1) {
    return 'Yesterday';
  }
  if (daysAgo > 1 && daysAgo <= WEEKDAY_WINDOW_DAYS) {
    return weekdayFormat.format(timestamp);
  }
  return dateFormat.format(timestamp);
}
