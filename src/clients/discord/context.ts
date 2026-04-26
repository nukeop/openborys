import type { ImagePart, ModelMessage, TextPart } from 'ai';
import type { Message as DiscordMessage } from 'discord.js';
import { DISCORD_CONFIG } from '../../config/platforms/discord';
import {
  createAssistantMessage,
  createUserMessage,
} from '../../services/ai-tools';
import { SystemPromptService } from '../../services/system-prompt';
import { formatTimestamp } from '../../utils/time';

// Maps a Discord message to an array of ModelMessage objects.
// Assistant messages cannot contain images, so they are mapped as though they were sent by the user.
// This can confuse the AI but is unavoidable (the only way to allow the bot to see its own images).
// One Discord message can map to multiple ModelMessages.
export const mapDiscordMessageToModelMessages = (
  message: DiscordMessage,
): ModelMessage[] => {
  const modelMessages: ModelMessage[] = [];
  const isOwnMessage = message.author.id === message.client.user.id;
  const timestamp = formatTimestamp(message.createdTimestamp);
  const serverNickname = (
    message.guild?.members.cache.get(message.author.id)?.displayName || ''
  ).replace(/[^a-zA-Z0-9_-]/g, '');
  const authorPrefix = !isOwnMessage ? `[${serverNickname}]` : '';

  const images = message.attachments.filter((attachment) =>
    attachment.contentType?.startsWith('image/'),
  );

  const messagePart: TextPart = {
    type: 'text',
    text: `[${timestamp}]${authorPrefix}: ${message.cleanContent}`,
  };
  const imageParts: ImagePart[] = images.map((image) => ({
    type: 'image',
    image: image.url,
  }));

  if (isOwnMessage && !message.attachments.size) {
    modelMessages.push(createAssistantMessage({ content: [messagePart] }));
  }

  if (isOwnMessage && message.attachments.size) {
    modelMessages.push(createUserMessage({ content: imageParts }));
  }

  if (!isOwnMessage) {
    modelMessages.push(
      createUserMessage({ content: [messagePart, ...imageParts] }),
    );
  }

  return modelMessages;
};

export const getLastMessages = async (
  message: DiscordMessage,
  contextWindowSize: number,
): Promise<ModelMessage[]> => {
  const rawMessages = await message.channel.messages.fetch({
    limit: contextWindowSize,
  });
  const messages = rawMessages
    .reverse()
    .values()
    .flatMap(mapDiscordMessageToModelMessages)
    .toArray();

  return messages;
};

export const getDiscordContext = async (message: DiscordMessage) => {
  const systemPrompt = SystemPromptService.getSystemPrompt();
  const context = await getLastMessages(
    message,
    DISCORD_CONFIG.contextSize.chat,
  );

  return { systemPrompt, context };
};
