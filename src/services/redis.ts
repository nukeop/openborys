import { RedisClient } from 'bun';
export class RedisService {
  static #redis: RedisClient;

  private constructor() {}

  static client(): RedisClient {
    if (!RedisService.#redis) {
      RedisService.#redis = new RedisClient();
    }

    return RedisService.#redis;
  }
}
