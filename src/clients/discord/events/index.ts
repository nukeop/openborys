import type { Client } from 'discord.js';
import { handleInteractionCreate } from './interactionCreate';
import { handleMessageCreate } from './messageCreate';
import { handleClientReady } from './ready';
import { handleTypingStart } from './typingStart';

export const loadEvents = async (client: Client) => {
  handleClientReady(client);
  handleMessageCreate(client);
  handleInteractionCreate(client);
  handleTypingStart(client);
};
