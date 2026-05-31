const DEFAULT_WINDOW_MS = 30_000;

export class ReplyDecisionCooldown {
  readonly #windowMs: number;
  readonly #pending = new Map<string, AbortController>();

  constructor(windowMs: number = DEFAULT_WINDOW_MS) {
    this.#windowMs = windowMs;
  }

  run = async <T>(
    channelId: string,
    task: (signal: AbortSignal) => Promise<T>,
  ): Promise<T> => {
    this.abort(channelId);

    const controller = new AbortController();
    this.#pending.set(channelId, controller);

    try {
      await this.#wait(controller.signal);
      return await task(controller.signal);
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

  #wait = (signal: AbortSignal): Promise<void> =>
    new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        signal.removeEventListener('abort', onAbort);
        resolve();
      }, this.#windowMs);

      const onAbort = () => {
        clearTimeout(timeout);
        reject(signal.reason);
      };

      signal.addEventListener('abort', onAbort, { once: true });
    });
}
