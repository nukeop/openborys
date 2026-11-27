const subsecondFormat = new Intl.DurationFormat('en', {
  style: 'narrow',
  millisecondsDisplay: 'always',
});

const secondsFormat = new Intl.DurationFormat('en', {
  style: 'narrow',
  milliseconds: 'numeric',
  fractionalDigits: 1,
  secondsDisplay: 'always',
});

const timestampFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'medium',
});

const shortTimestampFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'short',
  timeStyle: 'short',
});

export function formatDuration(ms: number) {
  if (ms < 1000) {
    return subsecondFormat.format({ milliseconds: ms });
  }

  return secondsFormat.format({
    minutes: Math.floor(ms / 60_000),
    seconds: Math.floor((ms % 60_000) / 1000),
    milliseconds: ms % 1000,
  });
}

export function formatTimestamp(timestamp: number) {
  return timestampFormat.format(timestamp);
}

export function formatShortTimestamp(timestamp: number) {
  return shortTimestampFormat.format(timestamp);
}
