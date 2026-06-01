import type { Attachment, Client, Message, TextBasedChannel } from 'discord.js';
import { DISCORD_CONFIG } from '../../config/platforms/discord';
import { cancelPendingDecision, decideReply } from './reply-decision';

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
  if (!message.channel.isSendable()) {
    return false;
  }

  if (message.mentions.has(client.user)) {
    cancelPendingDecision(message.channelId);
    return true;
  }

  return decideReply(message);
};

export const findAttachments = async (
  channel: TextBasedChannel,
  attachmentIds: string[],
): Promise<string[]> => {
  const messages = await channel.messages.fetch({
    limit: DISCORD_CONFIG.contextSize.attachments,
  });

  const allAttachmentsInScope = messages.flatMap(
    (message) => message.attachments,
  );

  return attachmentIds
    .map((id) => allAttachmentsInScope.find((a) => a.id === id))
    .filter((attachment): attachment is Attachment => Boolean(attachment))
    .map((attachment) => attachment.url);
};
