import { getLogger } from '@logtape/logtape';
import type { Client } from 'discord.js';
import { runAgent } from '../../../agents/discord';
import { errorMessage } from '../../../utils/error';
import { shouldReply } from '../utils';

const logger = getLogger(['OpenBorys', 'Discord', 'Events', 'MessageCreate']);

export const handleMessageCreate = (client: Client) => {
  client.on('messageCreate', async (message) => {
    try {
      const willReply = await shouldReply(client, message);
      if (!willReply) {
        return;
      }
      await message.channel.sendTyping();

      await runAgent(message);
    } catch (error) {
      logger.error('Unhandled error in messageCreate handler: {message}', {
        message: errorMessage(error),
      });
    }
  });
};
