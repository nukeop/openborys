import type { Client, Message } from 'discord.js';

export const shouldReply = async (
  client: Client,
  message: Message,
): Promise<boolean> => {
  if (message.author.id === message.client.user.id) {
    return false;
  }
  if (!client.user) {
    return false;
  }
  if (!message.mentions.has(client.user)) {
    return false;
  }
  if (!message.channel.isSendable()) {
    return false;
  }

  return true;
};
