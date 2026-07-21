export const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('pl-PL', {
    timeZone: 'Europe/Warsaw',
  });
};

const leadingTimestampsPattern =
  /^(?:\[\d{1,2}\.\d{1,2}\.\d{4}, \d{1,2}:\d{2}:\d{2}\]\s*:?\s*)+/;

export const stripLeadingTimestamps = (text: string) => {
  return text.replace(leadingTimestampsPattern, '');
};
