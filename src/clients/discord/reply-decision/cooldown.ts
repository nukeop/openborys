import { TYPING_DURATION_MS, type TypingTracker } from './typing-tracker';

export type CooldownResult<T> =
  | { status: 'completed'; value: T }
  | { status: 'aborted' };

export class ReplyDecisionCooldown {
  readonly #pending = new Map<string, AbortController>();
  readonly #typing: TypingTracker;

  constructor(typing: TypingTracker) {
    this.#typing = typing;
  }

  run = async <T>(
    channelId: string,
    task: (signal: AbortSignal) => Promise<T>,
  ): Promise<CooldownResult<T>> => {
    this.abort(channelId);

    const controller = new AbortController();
    this.#pending.set(channelId, controller);

    try {
      await this.#wait(channelId, Date.now(), controller.signal);
      const value = await task(controller.signal);
      return { status: 'completed', value };
    } catch (error) {
      if (controller.signal.aborted) {
        return { status: 'aborted' };
      }
      throw error;
    } finally {
      if (this.#pending.get(channelId) === controller) {
        this.#pending.delete(channelId);
      }
    }
  };

  abort = (channelId: string): void => {
    this.#pending.get(channelId)?.abort();
    this.#pending.delete(channelId);
  };

  #wait = (
    channelId: string,
    startedAt: number,
    signal: AbortSignal,
  ): Promise<void> =>
    new Promise((resolve, reject) => {
      let timeout: ReturnType<typeof setTimeout> | undefined;

      const onAbort = () => {
        clearTimeout(timeout);
        reject(signal.reason);
      };

      const check = () => {
        let readyAt = startedAt + 3_000;
        const latestTyping = this.#typing.latest(channelId);
        if (latestTyping !== undefined) {
          readyAt = Math.max(readyAt, latestTyping + TYPING_DURATION_MS);
        }

        const remaining = readyAt - Date.now();
        if (remaining > 0) {
          timeout = setTimeout(check, remaining);
          return;
        }
        signal.removeEventListener('abort', onAbort);
        resolve();
      };

      signal.addEventListener('abort', onAbort, { once: true });
      check();
    });
}
