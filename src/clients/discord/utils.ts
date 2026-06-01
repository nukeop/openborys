import type { Attachment, Client, Message, TextBasedChannel } from 'discord.js';
import type { ReplyTrigger } from '../../agents/discord/types';
import { DISCORD_CONFIG } from '../../config/platforms/discord';
import { cancelPendingDecision, decideReply } from './reply-decision';

export const shouldReply = async (
  client: Client,
  message: Message,
): Promise<ReplyTrigger | null> => {
  if (message.author.id === message.client.user.id) {
    return null;
  }
  if (!client.user) {
    return null;
  }
  if (!message.channel.isSendable()) {
    return null;
  }

  if (message.mentions.has(client.user)) {
    cancelPendingDecision(message.channelId);
    return 'mention';
  }

  const decided = await decideReply(message);
  return decided ? 'decision' : null;
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
