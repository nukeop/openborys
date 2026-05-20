import type {
  Client,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import type { Command } from '../types';

export class DiscordCommandsService {
  static #commands: Command[] = [];

  static registerCommand = (command: Command) => {
    DiscordCommandsService.#commands.push(command);
  };

  static unregisterCommand = (name: string) => {
    DiscordCommandsService.#commands = DiscordCommandsService.#commands.filter(
      (entry) => entry.data.name !== name,
    );
  };

  static findByName = (name: string): Command | undefined =>
    DiscordCommandsService.#commands.find((entry) => entry.data.name === name);

  static getAllAsJSON = (): RESTPostAPIChatInputApplicationCommandsJSONBody[] =>
    DiscordCommandsService.#commands.map((command) => command.data.toJSON());

  static reloadCommands = async (client: Client) =>
    client.application?.commands.set(DiscordCommandsService.getAllAsJSON());
}
