import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { PhoneConversation } from '../components/phone/PhoneConversation';
import { phoneConversationQuery } from '../queries/phone-conversation';

export function PhoneChat() {
  const params = useParams<{ contact: string }>();
  const contact = decodeURIComponent(params.contact ?? '');
  const { data } = useQuery(phoneConversationQuery(contact));

  return (
    <div className="fixed inset-0 z-20 sm:static sm:z-auto sm:mx-auto sm:max-w-2xl sm:p-8">
      <title>{contact}</title>
      <div className="h-full overflow-hidden bg-zinc-950 sm:h-[calc(100dvh-8rem)]">
        <PhoneConversation contact={contact} messages={data} />
      </div>
    </div>
  );
}
