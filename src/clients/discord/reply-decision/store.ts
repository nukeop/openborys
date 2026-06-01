export type ReplyDecision = {
  shouldReply: boolean;
  reason: string;
  timestamp: number;
};

const MAX_DECISIONS_PER_CHANNEL = 10;

export class ReplyDecisionStore {
  static #history = new Map<string, ReplyDecision[]>();

  static record = (channelId: string, decision: ReplyDecision): void => {
    const previous = ReplyDecisionStore.#history.get(channelId) ?? [];
    const next = [decision, ...previous].slice(0, MAX_DECISIONS_PER_CHANNEL);
    ReplyDecisionStore.#history.set(channelId, next);
  };

  static getLatest = (channelId: string): ReplyDecision | undefined =>
    ReplyDecisionStore.#history.get(channelId)?.at(0);

  static getHistory = (channelId: string): ReplyDecision[] =>
    ReplyDecisionStore.#history.get(channelId) ?? [];

  static getRecent = (limit: number): ReplyDecision[] =>
    [...ReplyDecisionStore.#history.values()]
      .flat()
      .sort((first, second) => second.timestamp - first.timestamp)
      .slice(0, limit);
}
