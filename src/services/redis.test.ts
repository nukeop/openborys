import { describe, expect, it } from 'bun:test';
import type { RedisClient } from 'bun';
import { RedisService } from './redis';

const currentClient = () =>
  RedisService.execute(async (client: RedisClient) => client);

const failingCall = () =>
  RedisService.execute(async () => {
    throw new Error('boom');
  }).catch(() => undefined);

const hangingCall = () =>
  RedisService.execute(() => new Promise<never>(() => {}));

describe('RedisService.execute', () => {
  it('returns the callback result', async () => {
    expect(await RedisService.execute(async () => 42)).toBe(42);
  });

  it('rethrows the error from the callback', async () => {
    const error = new Error('specific failure');

    await expect(
      RedisService.execute(async () => {
        throw error;
      }),
    ).rejects.toBe(error);
  });

  it('gives the same client to consecutive successful calls', async () => {
    const first = await currentClient();

    expect(await currentClient()).toBe(first);
  });

  it('gives a new client after a failed call', async () => {
    const before = await currentClient();
    await failingCall();

    expect(await currentClient()).not.toBe(before);
  });

  it('rejects a hanging call with a timeout error', async () => {
    await expect(hangingCall()).rejects.toThrow(
      new Error('Redis operation timed out after 5000ms'),
    );
  }, 10_000);

  it('gives a new client after a timed out call', async () => {
    const before = await currentClient();
    await hangingCall().catch(() => undefined);

    expect(await currentClient()).not.toBe(before);
  }, 10_000);

  it('gives a new client after the connection closes', async () => {
    const before = await currentClient();
    before.onclose?.call(before, new Error('connection lost'));

    expect(await currentClient()).not.toBe(before);
  });

  it('keeps the replacement client when an old connection closes late', async () => {
    const old = await currentClient();
    await failingCall();
    const replacement = await currentClient();
    old.onclose?.call(old, new Error('late close'));

    expect(await currentClient()).toBe(replacement);
  });
});
