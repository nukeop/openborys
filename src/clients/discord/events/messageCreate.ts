import { getLogger } from '@logtape/logtape';
import type { Client } from 'discord.js';
import { ai } from '../../../services/ai';
import { getDiscordContext } from '../context';
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
      const { systemPrompt, context } = await getDiscordContext(message);

      const reply = await ai.generateText({
        messages: [
          { role: 'system', content: systemPrompt },
          ...context
        ]
      });

      message.channel.send(reply.text)

    } catch (error) {
      logger.error('Unhandled error in messageCreate handler', { error });
    }
  });
};
