import { beforeEach, describe, expect, it, mock, spyOn } from 'bun:test';
import type { ToolCallPart, ToolResultPart } from 'ai';
import { RedisService } from './redis';
import {
  RedisToolCallService,
  type StoredToolCall,
  type StoredToolResult,
} from './redis-tool-calls';

const mockClient = {
  set: mock(),
  zadd: mock(),
  expire: mock(),
  get: mock(),
  zrangebyscore: mock(),
  send: mock(),
};

spyOn(RedisService, 'client').mockReturnValue(mockClient as any);

const sampleCall: ToolCallPart = {
  type: 'tool-call',
  toolCallId: 'call_123',
  toolName: 'weather',
  input: { location: 'Tokyo' },
};

const sampleResult: ToolResultPart = {
  type: 'tool-result',
  toolCallId: 'call_123',
  toolName: 'weather',
  output: { type: 'text', value: '22' },
};

const serverId = 'server_abc';
const channelId = 'channel_xyz';
const timestamp = 1700000000000;

describe('RedisToolCallService', () => {
  beforeEach(() => {
    mockClient.set.mockReset();
    mockClient.zadd.mockReset();
    mockClient.expire.mockReset();
    mockClient.get.mockReset();
    mockClient.zrangebyscore.mockReset();
    mockClient.send.mockReset();
  });

  describe('addToolCall', () => {
    it('stores data with TTL, indexes by timestamp, and expires the index', async () => {
      const stored: StoredToolCall = {
        call: sampleCall,
        channelId,
        serverId,
        timestamp,
      };

      await RedisToolCallService.addToolCall(stored);

      expect(mockClient.set).toHaveBeenCalledWith(
        'toolcall:data:call_123',
        JSON.stringify(stored),
        'EX',
        604800,
      );
      expect(mockClient.zadd).toHaveBeenCalledWith(
        'toolcall:index:server_abc:channel_xyz',
        timestamp,
        'call_123',
      );
      expect(mockClient.expire).toHaveBeenCalledWith(
        'toolcall:index:server_abc:channel_xyz',
        604800,
      );
    });
  });

  describe('addToolResult', () => {
    it('stores data with TTL, indexes by timestamp, and expires the index', async () => {
      const stored: StoredToolResult = {
        result: sampleResult,
        channelId,
        serverId,
        timestamp,
      };

      await RedisToolCallService.addToolResult(stored);

      expect(mockClient.set).toHaveBeenCalledWith(
        'toolresult:data:call_123',
        JSON.stringify(stored),
        'EX',
        604800,
      );
      expect(mockClient.zadd).toHaveBeenCalledWith(
        'toolresult:index:server_abc:channel_xyz',
        timestamp,
        'call_123',
      );
      expect(mockClient.expire).toHaveBeenCalledWith(
        'toolresult:index:server_abc:channel_xyz',
        604800,
      );
    });
  });

  describe('getToolCall', () => {
    it('returns the parsed StoredToolCall when the key exists', async () => {
      const stored: StoredToolCall = {
        call: sampleCall,
        channelId,
        serverId,
        timestamp,
      };
      mockClient.get.mockResolvedValue(JSON.stringify(stored));

      const result = await RedisToolCallService.getToolCall('call_123');

      expect(mockClient.get).toHaveBeenCalledWith('toolcall:data:call_123');
      expect(result).toEqual(stored);
    });

    it('returns null when the key does not exist', async () => {
      mockClient.get.mockResolvedValue(null);

      const result = await RedisToolCallService.getToolCall('call_missing');

      expect(result).toBeNull();
    });
  });

  describe('getToolResult', () => {
    it('returns the parsed StoredToolResult when the key exists', async () => {
      const stored: StoredToolResult = {
        result: sampleResult,
        channelId,
        serverId,
        timestamp,
      };
      mockClient.get.mockResolvedValue(JSON.stringify(stored));

      const result = await RedisToolCallService.getToolResult('call_123');

      expect(mockClient.get).toHaveBeenCalledWith('toolresult:data:call_123');
      expect(result).toEqual(stored);
    });

    it('returns null when the key does not exist', async () => {
      mockClient.get.mockResolvedValue(null);

      const result = await RedisToolCallService.getToolResult('call_missing');

      expect(result).toBeNull();
    });
  });

  describe('getCallsInRange', () => {
    it('queries the index and hydrates IDs into full StoredToolCall objects', async () => {
      const storedA: StoredToolCall = {
        call: { ...sampleCall, toolCallId: 'call_a' },
        channelId,
        serverId,
        timestamp: 1700000000000,
      };
      const storedB: StoredToolCall = {
        call: { ...sampleCall, toolCallId: 'call_b' },
        channelId,
        serverId,
        timestamp: 1700000001000,
      };

      mockClient.zrangebyscore.mockResolvedValue(['call_a', 'call_b']);
      mockClient.send.mockResolvedValue([
        JSON.stringify(storedA),
        JSON.stringify(storedB),
      ]);

      const from = 1700000000000;
      const to = 1700000002000;
      const results = await RedisToolCallService.getCallsInRange(
        serverId,
        channelId,
        from,
        to,
      );

      expect(mockClient.zrangebyscore).toHaveBeenCalledWith(
        'toolcall:index:server_abc:channel_xyz',
        from,
        to,
      );
      expect(mockClient.send).toHaveBeenCalledWith('MGET', [
        'toolcall:data:call_a',
        'toolcall:data:call_b',
      ]);
      expect(results).toEqual([storedA, storedB]);
    });

    it('returns an empty array when no IDs are in range', async () => {
      mockClient.zrangebyscore.mockResolvedValue([]);

      const results = await RedisToolCallService.getCallsInRange(
        serverId,
        channelId,
        0,
        1,
      );

      expect(results).toEqual([]);
      expect(mockClient.send).not.toHaveBeenCalled();
    });

    it('filters out null entries from expired data keys', async () => {
      const stored: StoredToolCall = {
        call: { ...sampleCall, toolCallId: 'call_alive' },
        channelId,
        serverId,
        timestamp,
      };

      mockClient.zrangebyscore.mockResolvedValue([
        'call_alive',
        'call_expired',
      ]);
      mockClient.send.mockResolvedValue([JSON.stringify(stored), null]);

      const results = await RedisToolCallService.getCallsInRange(
        serverId,
        channelId,
        0,
        timestamp,
      );

      expect(results).toEqual([stored]);
    });
  });

  describe('getResultsInRange', () => {
    it('queries the index and hydrates IDs into full StoredToolResult objects', async () => {
      const storedA: StoredToolResult = {
        result: { ...sampleResult, toolCallId: 'call_a' },
        channelId,
        serverId,
        timestamp: 1700000000000,
      };
      const storedB: StoredToolResult = {
        result: { ...sampleResult, toolCallId: 'call_b' },
        channelId,
        serverId,
        timestamp: 1700000001000,
      };

      mockClient.zrangebyscore.mockResolvedValue(['call_a', 'call_b']);
      mockClient.send.mockResolvedValue([
        JSON.stringify(storedA),
        JSON.stringify(storedB),
      ]);

      const from = 1700000000000;
      const to = 1700000002000;
      const results = await RedisToolCallService.getResultsInRange(
        serverId,
        channelId,
        from,
        to,
      );

      expect(mockClient.zrangebyscore).toHaveBeenCalledWith(
        'toolresult:index:server_abc:channel_xyz',
        from,
        to,
      );
      expect(mockClient.send).toHaveBeenCalledWith('MGET', [
        'toolresult:data:call_a',
        'toolresult:data:call_b',
      ]);
      expect(results).toEqual([storedA, storedB]);
    });

    it('returns an empty array when no IDs are in range', async () => {
      mockClient.zrangebyscore.mockResolvedValue([]);

      const results = await RedisToolCallService.getResultsInRange(
        serverId,
        channelId,
        0,
        1,
      );

      expect(results).toEqual([]);
      expect(mockClient.send).not.toHaveBeenCalled();
    });

    it('filters out null entries from expired data keys', async () => {
      const stored: StoredToolResult = {
        result: { ...sampleResult, toolCallId: 'call_alive' },
        channelId,
        serverId,
        timestamp,
      };

      mockClient.zrangebyscore.mockResolvedValue([
        'call_alive',
        'call_expired',
      ]);
      mockClient.send.mockResolvedValue([JSON.stringify(stored), null]);

      const results = await RedisToolCallService.getResultsInRange(
        serverId,
        channelId,
        0,
        timestamp,
      );

      expect(results).toEqual([stored]);
    });
  });
});
