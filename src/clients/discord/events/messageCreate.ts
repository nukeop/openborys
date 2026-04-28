import { getLogger } from '@logtape/logtape';
import type { Client } from 'discord.js';
import { runAgent } from '../../../agents/discord';
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

      // Old implementation, kept for reference:
      //
      // const { systemPrompt, context } = await getDiscordContext(message);
      // const serverId = message.guildId ?? 'dm';
      // const channelId = message.channelId;
      //
      // const reply = await ai.generateText({
      //   messages: [{ role: 'system', content: systemPrompt }, ...context],
      //   onStepFinish: async (step) => {
      //     const timestamp = Date.now();
      //
      //     step.toolCalls.forEach((call) => {
      //       logger.info('Tool called: {toolName}', {
      //         toolName: call.toolName,
      //       });
      //     });
      //
      //     await Promise.all([
      //       ...step.toolCalls.map((call) =>
      //         RedisToolCallService.addToolCall({
      //           call,
      //           serverId,
      //           channelId,
      //           timestamp,
      //         }),
      //       ),
      //       ...step.toolResults.map((result) =>
      //         RedisToolCallService.addToolResult({
      //           result,
      //           serverId,
      //           channelId,
      //           timestamp,
      //         }),
      //       ),
      //     ]);
      //   },
      // });
      //
      // message.channel.send(reply.text);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Unhandled error in messageCreate handler: {message}', {
        message,
      });
    }
  });
};
