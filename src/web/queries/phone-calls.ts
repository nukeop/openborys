import type { PhoneMessage } from '../../tools/phone/message-cache';

export const phoneCallsQuery = {
  queryKey: ['phone-calls'] as const,
  queryFn: async (): Promise<PhoneMessage[]> =>
    (await (await fetch('/api/phone-calls')).json()) as PhoneMessage[],
};
