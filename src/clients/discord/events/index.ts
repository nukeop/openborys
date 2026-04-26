import type { Client } from 'discord.js';
import { handleMessageCreate } from './messageCreate';
import { handleClientReady } from './ready';

export const loadEvents = async (client: Client) => {
  handleClientReady(client);
  handleMessageCreate(client);
};
