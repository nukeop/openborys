import type { ImagePart, ModelMessage, TextPart } from 'ai';
import type { Message as DiscordMessage } from 'discord.js';
import { DISCORD_CONFIG } from '../../config/platforms/discord';
import {
  createAssistantMessage,
  createToolResult,
  createUserMessage,
} from '../../services/ai-utils';
import { EmbeddingsService } from '../../services/embeddings';
import {
  RedisToolCallService,
  type StoredToolCall,
  type StoredToolResult,
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

type TimestampedMessages = {
  timestamp: number;
  messages: ModelMessage[];
};

const discordToTimestamped = (
  message: DiscordMessage,
): TimestampedMessages => ({
  timestamp: message.createdTimestamp,
  messages: mapDiscordMessageToModelMessages(message),
});

const toolPairToTimestamped = (
  call: StoredToolCall,
  result: StoredToolResult,
): TimestampedMessages => ({
  timestamp: call.timestamp,
  messages: [
    createAssistantMessage({ content: [call.call] }),
    createToolResult({ content: [result.result] }),
  ],
});

export const getLastMessages = async (
  message: DiscordMessage,
  contextWindowSize: number,
): Promise<ModelMessage[]> => {
  const rawMessages = await message.channel.messages.fetch({
    limit: contextWindowSize,
  });
  const sorted = rawMessages.reverse();

  const first = sorted.first();
  const last = sorted.last();

  if (!first || !last) {
    return [];
  }

  const serverId = message.guildId ?? 'dm';
  const channelId = message.channelId;

  const toolPairs = await getToolMessages(
    serverId,
    channelId,
    first.createdTimestamp,
    last.createdTimestamp,
  );

  const discordEntries = sorted.map(discordToTimestamped).values().toArray();
  const toolEntries = toolPairs.map(({ call, result }) =>
    toolPairToTimestamped(call, result),
  );

  return [...discordEntries, ...toolEntries]
    .sort((a, b) => a.timestamp - b.timestamp)
    .flatMap((entry) => entry.messages);
};

type ToolPair = { call: StoredToolCall; result: StoredToolResult };

// Fetches all calls and results within a given time range.
// For every call or result that doesn't have its pair in the initial fetch, we fetch the missing counterpart by id.
// This is needed because APIs will reject tool calls without results or vice versa.
const getToolMessages = async (
  serverId: string,
  channelId: string,
  from: number,
  to: number,
): Promise<ToolPair[]> => {
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

  return allCalls
    .map((call) => ({
      call,
      result: allResults.find(
        (result) => result.result.toolCallId === call.call.toolCallId,
      ),
    }))
    .filter((pair): pair is ToolPair => pair.result !== undefined);
};

const getRelevantMemories = async (
  message: DiscordMessage,
): Promise<string[]> => {
  const recent = await message.channel.messages.fetch({
    limit: DISCORD_CONFIG.contextSize.memories,
  });
  const text = recent
    .map((msg) => msg.cleanContent)
    .reverse()
    .join('\n');
  return EmbeddingsService.search(text);
};

const formatMemories = (memories: string[]): string => {
  if (memories.length === 0) {
    return '';
  }

  return (
    '\n\n<memories>\n' +
    memories.map((memory, ix) => `${ix + 1}. ${memory}`).join('\n') +
    '\n</memories>'
  );
};

export const getDiscordContext = async (message: DiscordMessage) => {
  const [context, memories] = await Promise.all([
    getLastMessages(message, DISCORD_CONFIG.contextSize.chat),
    getRelevantMemories(message),
  ]);

  const systemPrompt =
    SystemPromptService.getSystemPrompt() + formatMemories(memories);

  return { systemPrompt, context };
};
