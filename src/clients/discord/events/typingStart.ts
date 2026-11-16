import { type Client, Events } from 'discord.js';
import { ReplyDecider } from '../reply-decision';

export const handleTypingStart = (client: Client) => {
  client.on(Events.TypingStart, (typing) => {
    if (typing.user.id === client.user?.id) {
      return;
    }
    ReplyDecider.recordTyping(typing.channel.id, typing.user.id);
  });
};
