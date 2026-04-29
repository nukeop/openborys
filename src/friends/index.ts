import type { Friend } from './types';

export { loadFriends } from './load-friends';
export type { Friend };

export class FriendsService {
  static #friends: Friend[] = [];

  static setFriends = (friends: Friend[]) => {
    FriendsService.#friends = friends;
  };

  static findByName = (name: string): Friend | undefined => {
    const needle = name.toLowerCase();
    return FriendsService.#friends.find((friend) =>
      needle.includes(friend.name.toLowerCase()),
    );
  };

  static getFriendsContext = (): string => {
    return FriendsService.#friends
      .map((friend) => `- ${friend.name}: ${friend.description}`)
      .join('\n');
  };
}
