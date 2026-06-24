export type PhoneMessage = {
  sender: 'bot' | 'contact';
  content: string;
  contact: string;
  timestamp: number;
};

export class PhoneMessageCache {
  static #instance: PhoneMessageCache;
  #cache: Map<string, PhoneMessage[]> = new Map();

  push(message: PhoneMessage): void {
    const history = this.#cache.get(message.contact) ?? [];
    history.push(message);
    this.#cache.set(message.contact, history);
  }

  getLastMessages(contact: string, count: number): PhoneMessage[] {
    return (this.#cache.get(contact) ?? []).slice(-count);
  }

  getRecentCalls(limit: number): PhoneMessage[] {
    const all = [...this.#cache.values()].flat();
    return all.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  static getInstance(): PhoneMessageCache {
    if (!PhoneMessageCache.#instance) {
      PhoneMessageCache.#instance = new PhoneMessageCache();
    }
    return PhoneMessageCache.#instance;
  }
}
