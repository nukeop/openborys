import type { Client } from 'discord.js';
import { handleClientReady } from './ready';

export const loadEvents = async (client: Client) => {
  handleClientReady(client);
};
