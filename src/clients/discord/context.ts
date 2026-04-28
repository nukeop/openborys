import type { ImagePart, ModelMessage, TextPart } from 'ai';
import type { Message as DiscordMessage } from 'discord.js';
import { DISCORD_CONFIG } from '../../config/platforms/discord';
import {
  createAssistantMessage,
  createToolResult,
  createUserMessage,
} from '../../services/ai-utils';
import {
  type StoredToolCall,
  type StoredToolResult,
  RedisToolCallService,
} from '../../services/redis-tool-calls';
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

// This fetches all calls and results within a given time range.
// For every call or result that doesn't have its pair in the initial fetch, we fetch the missing counterpart by id.
// This is needed because APIs will reject calls that have tool calls without results or vice versa.
export const getToolMessages = async (
  serverId: string,
  channelId: string,
  from: number,
  to: number,
): Promise<ModelMessage[]> => {
  const calls = await RedisToolCallService.getCallsInRange(
    serverId,
    channelId,
    from,
    to,
  );
  const results = await RedisToolCallService.getResultsInRange(
    serverId,
    channelId,
    from,
    to,
  );

  const unpairedCalls = calls.filter(
    (call) =>
      !results.some(
        (result) => result.result.toolCallId === call.call.toolCallId,
      ),
  );
  const unpairedResults = results.filter(
    (result) =>
      !calls.some((call) => call.call.toolCallId === result.result.toolCallId),
  );

  const missingCalls = await Promise.all(
    unpairedResults.map((result) =>
      RedisToolCallService.getToolCall(result.result.toolCallId),
    ),
  );
  const missingResults = await Promise.all(
    unpairedCalls.map((call) =>
      RedisToolCallService.getToolResult(call.call.toolCallId),
    ),
  );

  const allCalls = [...calls, ...missingCalls].filter(
    Boolean,
  ) as StoredToolCall[];
  const allResults = [...results, ...missingResults].filter(
    Boolean,
  ) as StoredToolResult[];

  const paired = allCalls
    .map((call) => ({
      call,
      result: allResults.find(
        (result) => result.result.toolCallId === call.call.toolCallId,
      ),
    }))
    .filter(
      (pair): pair is { call: StoredToolCall; result: StoredToolResult } =>
        pair.result !== undefined,
    );

  return paired.flatMap(({ call, result }) => [
    createAssistantMessage({ content: [call.call] }),
    createToolResult({ content: [result.result] }),
  ]);
};

export const getDiscordContext = async (message: DiscordMessage) => {
  const systemPrompt = SystemPromptService.getSystemPrompt();
  const context = await getLastMessages(
    message,
    DISCORD_CONFIG.contextSize.chat,
  );

  return { systemPrompt, context };
};
