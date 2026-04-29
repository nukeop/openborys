type PhoneMessage = {
  sender: 'bot' | 'contact';
  content: string;
};

export class PhoneMessageCache {
  static #instance: PhoneMessageCache;
  #cache: Map<string, PhoneMessage[]> = new Map();

  push(contact: string, message: PhoneMessage): void {
    const history = this.#cache.get(contact) ?? [];
    history.push(message);
    this.#cache.set(contact, history);
  }

  getLastMessages(contact: string, count: number): PhoneMessage[] {
    return (this.#cache.get(contact) ?? []).slice(-count);
  }

  static getInstance(): PhoneMessageCache {
    if (!PhoneMessageCache.#instance) {
      PhoneMessageCache.#instance = new PhoneMessageCache();
    }
    return PhoneMessageCache.#instance;
  }
}
