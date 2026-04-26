import type { ModelMessage } from 'ai';
import type { Message } from 'discord.js';
import { DISCORD_CONFIG } from '../../config/platforms/discord';
import { SystemPromptService } from '../../services/system-prompt';
import { formatTimestamp } from '../../utils/time';

export const getLastMessages = async (message: Message,
  contextWindowSize: number): Promise<ModelMessage[]> => {
  const rawMessages = await message.channel.messages.fetch({
    limit: contextWindowSize,
  });
  const messages = rawMessages.reverse().filter(message => message.cleanContent).map(message => {
    const isOwnMessage = message.author.id === message.client.user.id;
    const timestamp = formatTimestamp(message.createdTimestamp);
    const serverNickname = (
      message.guild?.members.cache.get(message.author.id)?.displayName || ''
    ).replace(/[^a-zA-Z0-9_-]/g, '');
    const authorPrefix = !isOwnMessage ? `[${serverNickname}]` : '';

    return ({
      role: message.author.id === message.client.user.id ? 'assistant' : 'user',
      content: `[${timestamp}]${authorPrefix}: ${message.cleanContent}`
    });
  });

  return messages as ModelMessage[];
}

export const getDiscordContext = async (message: Message) => {
  const systemPrompt = SystemPromptService.getSystemPrompt();
  const context = await getLastMessages(message, DISCORD_CONFIG.contextSize.chat);

  return { systemPrompt, context }
};
