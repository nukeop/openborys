import { env } from '../environment';
import type { ScriptResult } from '../tools/run-script/run-script';
import { RedisService } from './redis';

export type StoredRun = {
  id: string;
  sourceMessageId: string;
  startedAt: number;
  endedAt: number;
  code: string;
  result: ScriptResult;
};

export class RunStore {
  static #ttlSeconds = 30 * 24 * 60 * 60;
  static #maxRecent = 100;

  private constructor() {}

  static #listKey() {
    return `runs:${env().BOT_NAME}`;
  }

  static #runKey(id: string) {
    return `runs:${env().BOT_NAME}:${id}`;
  }

  static async save(run: StoredRun) {
    await RedisService.execute(async (client) => {
      await client.set(
        RunStore.#runKey(run.id),
        JSON.stringify(run),
        'EX',
        RunStore.#ttlSeconds,
      );

      await client.lpush(RunStore.#listKey(), run.id);
      await client.ltrim(RunStore.#listKey(), 0, RunStore.#maxRecent - 1);
    });
  }

  static async get(id: string): Promise<StoredRun | null> {
    return RedisService.execute(async (client) => {
      const raw = await client.get(RunStore.#runKey(id));
      if (!raw) {
        return null;
      }

      return JSON.parse(raw);
    });
  }

  static async listRecent(): Promise<StoredRun[]> {
    return RedisService.execute(async (client) => {
      const ids = await client.lrange(RunStore.#listKey(), 0, -1);
      if (!ids.length) {
        return [];
      }

      const raw = await client.mget(...ids.map((id) => RunStore.#runKey(id)));

      return raw
        .filter((entry) => entry !== null)
        .map((entry) => JSON.parse(entry));
    });
  }
}
