import type { ToolCallPart, ToolResultPart } from 'ai';
import { RedisService } from './redis';

const TTL_SECONDS = 604800; // 7 days

export type StoredToolCall = {
  call: ToolCallPart;
  channelId: string;
  serverId: string;
  timestamp: number;
};

export type StoredToolResult = {
  result: ToolResultPart;
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
    const { call, channelId, serverId, timestamp } = stored;

    await RedisService.execute(async (client) => {
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
    });
  }

  static async addToolResult(stored: StoredToolResult): Promise<void> {
    const { result, channelId, serverId, timestamp } = stored;

    await RedisService.execute(async (client) => {
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
    });
  }

  static async getToolCall(toolCallId: string): Promise<StoredToolCall | null> {
    return RedisService.execute(async (client) => {
      const raw = await client.get(RedisToolCallService.#callKey(toolCallId));

      if (!raw) {
        return null;
      }
      return JSON.parse(raw) as StoredToolCall;
    });
  }

  static async getToolResult(
    toolCallId: string,
  ): Promise<StoredToolResult | null> {
    return RedisService.execute(async (client) => {
      const raw = await client.get(RedisToolCallService.#resultKey(toolCallId));

      if (!raw) {
        return null;
      }
      return JSON.parse(raw) as StoredToolResult;
    });
  }

  static async getCallsInRange(
    serverId: string,
    channelId: string,
    from: number,
    to: number,
  ): Promise<StoredToolCall[]> {
    return RedisService.execute(async (client) => {
      const ids = await client.zrangebyscore(
        RedisToolCallService.#callIndexKey(serverId, channelId),
        from,
        to,
      );

      if (!ids.length) {
        return [];
      }

      const keys = ids.map((id) => RedisToolCallService.#callKey(id));
      const raw = (await client.send('MGET', keys)) as unknown;

      if (!Array.isArray(raw)) {
        throw new Error(
          `Expected MGET to return an array, got ${typeof raw}: ${String(raw).slice(0, 100)}`,
        );
      }

      return (raw as (string | null)[])
        .filter((entry): entry is string => entry !== null)
        .map((entry) => JSON.parse(entry) as StoredToolCall);
    });
  }

  static async getResultsInRange(
    serverId: string,
    channelId: string,
    from: number,
    to: number,
  ): Promise<StoredToolResult[]> {
    return RedisService.execute(async (client) => {
      const ids = await client.zrangebyscore(
        RedisToolCallService.#resultIndexKey(serverId, channelId),
        from,
        to,
      );

      if (!ids.length) {
        return [];
      }

      const keys = ids.map((id) => RedisToolCallService.#resultKey(id));
      const raw = (await client.send('MGET', keys)) as unknown;

      if (!Array.isArray(raw)) {
        throw new Error(
          `Expected MGET to return an array, got ${typeof raw}: ${String(raw).slice(0, 100)}`,
        );
      }

      return (raw as (string | null)[])
        .filter((entry): entry is string => entry !== null)
        .map((entry) => JSON.parse(entry) as StoredToolResult);
    });
  }
}
