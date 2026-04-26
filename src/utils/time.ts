export const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp).toLocaleString(
    'pl-PL',
    {
      timeZone: 'Europe/Warsaw',
    },
  );
}
