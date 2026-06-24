import type { PhoneMessage } from '../../tools/phone/message-cache';

export const phoneConversationQuery = (contact: string) => ({
  queryKey: ['phone-conversation', contact] as const,
  queryFn: async (): Promise<PhoneMessage[]> =>
    (await (
      await fetch(`/api/phone-conversation/${encodeURIComponent(contact)}`)
    ).json()) as PhoneMessage[],
});
