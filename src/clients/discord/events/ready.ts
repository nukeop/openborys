import { getLogger } from '@logtape/logtape';
import type { Client } from 'discord.js';

const logger = getLogger(['OpenBorys', 'Discord', 'Events', 'Ready']);

export const handleClientReady = (client: Client) => {
  client.on('clientReady', async () => {
    logger.info('Discord client is ready');
    logger.info('Logged in as {tag}!', { tag: client.user?.tag });
  });
};
