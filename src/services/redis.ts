import { getLogger } from '@logtape/logtape';
import { RedisClient } from 'bun';

const logger = getLogger(['OpenBorys', 'Service', 'Redis']);

const TIMEOUT_MS = 5_000;

export class RedisService {
  static #redis: RedisClient | null = null;

  private constructor() {}

  static async execute<T>(
    callback: (client: RedisClient) => Promise<T>,
  ): Promise<T> {
    const client = RedisService.#acquireClient();

    try {
      return await RedisService.#withTimeout(callback(client));
    } catch (error) {
      RedisService.#dropClient(client);
      logger.error('Redis operation failed, client dropped: {error}', {
        error,
      });
      throw error;
    }
  }

  static #acquireClient(): RedisClient {
    if (!RedisService.#redis) {
      const client = new RedisClient();
      client.onclose = () => {
        RedisService.#dropClient(client);
        logger.warn('Redis connection closed, client dropped');
      };
      RedisService.#redis = client;
    }

    return RedisService.#redis;
  }

  static #dropClient(client: RedisClient): void {
    if (RedisService.#redis !== client) {
      return;
    }

    RedisService.#redis = null;

    try {
      client.close();
    } catch {}
  }

  static async #withTimeout<T>(promise: Promise<T>): Promise<T> {
    let timer: Timer | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () =>
          reject(new Error(`Redis operation timed out after ${TIMEOUT_MS}ms`)),
        TIMEOUT_MS,
      );
    });

    try {
      return await Promise.race([promise, timeout]);
    } finally {
      clearTimeout(timer);
    }
  }
}
