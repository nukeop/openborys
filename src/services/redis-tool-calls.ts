import type {
  ToolCallPart,
  ToolResultPart,
  ToolSet,
  TypedToolCall,
  TypedToolResult,
} from 'ai';
import { RedisService } from './redis';

const TTL_SECONDS = 604800; // 7 days

export type StoredToolCall = {
  call: ToolCallPart | TypedToolCall<ToolSet>;
  channelId: string;
  serverId: string;
  timestamp: number;
};

export type StoredToolResult = {
  result: ToolResultPart | TypedToolResult<ToolSet>;
  channelId: string;
  serverId: string;
  timestamp: number;
};

export class RedisToolCallService {
  static #callKey(toolCallId: string): string {
    return `toolcall:data:${toolCallId}`;
  }

  static #resultKey(toolCallId: string): string {
    return `toolresult:data:${toolCallId}`;
  }

  static #contextKey(serverId: string, channelId: string): string {
    return `${serverId}:${channelId}`;
  }

  static #callIndexKey(serverId: string, channelId: string): string {
    return `toolcall:index:${RedisToolCallService.#contextKey(serverId, channelId)}`;
  }

  static #resultIndexKey(serverId: string, channelId: string): string {
    return `toolresult:index:${RedisToolCallService.#contextKey(serverId, channelId)}`;
  }

  static async addToolCall(stored: StoredToolCall): Promise<void> {
    const client = RedisService.client();
    const { call, channelId, serverId, timestamp } = stored;

    await client.set(
      RedisToolCallService.#callKey(call.toolCallId),
      JSON.stringify(stored),
      'EX',
      TTL_SECONDS,
    );
    await client.zadd(
      RedisToolCallService.#callIndexKey(serverId, channelId),
      timestamp,
      call.toolCallId,
    );
    await client.expire(
      RedisToolCallService.#callIndexKey(serverId, channelId),
      TTL_SECONDS,
    );
  }

  static async addToolResult(stored: StoredToolResult): Promise<void> {
    const client = RedisService.client();
    const { result, channelId, serverId, timestamp } = stored;

    await client.set(
      RedisToolCallService.#resultKey(result.toolCallId),
      JSON.stringify(stored),
      'EX',
      TTL_SECONDS,
    );
    await client.zadd(
      RedisToolCallService.#resultIndexKey(serverId, channelId),
      timestamp,
      result.toolCallId,
    );
    await client.expire(
      RedisToolCallService.#resultIndexKey(serverId, channelId),
      TTL_SECONDS,
    );
  }

  static async getToolCall(toolCallId: string): Promise<StoredToolCall | null> {
    const client = RedisService.client();
    const raw = await client.get(RedisToolCallService.#callKey(toolCallId));

    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as StoredToolCall;
  }

  static async getToolResult(
    toolCallId: string,
  ): Promise<StoredToolResult | null> {
    const client = RedisService.client();
    const raw = await client.get(RedisToolCallService.#resultKey(toolCallId));

    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as StoredToolResult;
  }

  static async getCallsInRange(
    serverId: string,
    channelId: string,
    from: number,
    to: number,
  ): Promise<StoredToolCall[]> {
    const client = RedisService.client();
    const ids = await client.zrangebyscore(
      RedisToolCallService.#callIndexKey(serverId, channelId),
      from,
      to,
    );

    if (!ids.length) {
      return [];
    }

    const keys = ids.map((id) => RedisToolCallService.#callKey(id));
    const raw = (await client.send('MGET', keys)) as (string | null)[];

    return raw
      .filter((entry): entry is string => entry !== null)
      .map((entry) => JSON.parse(entry) as StoredToolCall);
  }

  static async getResultsInRange(
    serverId: string,
    channelId: string,
    from: number,
    to: number,
  ): Promise<StoredToolResult[]> {
    const client = RedisService.client();
    const ids = await client.zrangebyscore(
      RedisToolCallService.#resultIndexKey(serverId, channelId),
      from,
      to,
    );

    if (!ids.length) {
      return [];
    }

    const keys = ids.map((id) => RedisToolCallService.#resultKey(id));
    const raw = (await client.send('MGET', keys)) as (string | null)[];

    return raw
      .filter((entry): entry is string => entry !== null)
      .map((entry) => JSON.parse(entry) as StoredToolResult);
  }
}
