import { getLogger } from '@logtape/logtape';
import type {
  Client,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import type { Command } from '../types';

const logger = getLogger(['OpenBorys', 'Discord', 'Commands']);

export class DiscordCommandsService {
  static #commands: Command[] = [];

  static registerCommand = (command: Command) => {
    DiscordCommandsService.#commands.push(command);
    logger.info('Registered command: /{name}', { name: command.data.name });
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

  static reloadCommands = async (client: Client) => {
    const names = DiscordCommandsService.#commands.map((c) => c.data.name);
    logger.info('Syncing {count} commands to Discord: {names}', {
      count: names.length,
      names: names.join(', '),
    });
    await client.application?.commands.set(
      DiscordCommandsService.getAllAsJSON(),
    );
  };
}
