import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { DeviceFrame } from '../components/phone/DeviceFrame';
import { PhoneConversation } from '../components/phone/PhoneConversation';
import { phoneConversationQuery } from '../queries/phone-conversation';

export function PhoneChat() {
  const params = useParams<{ contact: string }>();
  const contact = decodeURIComponent(params.contact ?? '');
  const { data } = useQuery(phoneConversationQuery(contact));

  return (
    <DeviceFrame>
      <title>{contact}</title>
      <PhoneConversation contact={contact} messages={data} />
    </DeviceFrame>
  );
}
