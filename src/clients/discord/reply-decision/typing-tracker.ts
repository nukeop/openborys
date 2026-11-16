export const TYPING_DURATION_MS = 10_000;

export class TypingTracker {
  readonly #typing = new Map<string, Map<string, number>>();

  record = (channelId: string, userId: string): void => {
    this.#dropStale(channelId);

    const users = this.#typing.get(channelId) ?? new Map<string, number>();
    users.set(userId, Date.now());
    this.#typing.set(channelId, users);
  };

  forget = (channelId: string, userId: string): void => {
    this.#typing.get(channelId)?.delete(userId);
  };

  latest = (channelId: string): number | undefined => {
    this.#dropStale(channelId);

    const users = this.#typing.get(channelId);
    if (!users) {
      return undefined;
    }
    return Math.max(...users.values());
  };

  #dropStale = (channelId: string): void => {
    const users = this.#typing.get(channelId);
    if (!users) {
      return;
    }

    const cutoff = Date.now() - TYPING_DURATION_MS;
    for (const [userId, typedAt] of users) {
      if (typedAt <= cutoff) {
        users.delete(userId);
      }
    }

    if (users.size === 0) {
      this.#typing.delete(channelId);
    }
  };
}
