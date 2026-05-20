import { getLogger } from '@logtape/logtape';
import { type Client, Events, type Interaction } from 'discord.js';
import { DiscordCommandsService } from '../services/discord-commands';

const logger = getLogger([
  'OpenBorys',
  'Discord',
  'Events',
  'InteractionCreate',
]);

export const handleInteractionCreate = (client: Client) => {
  client.on(Events.InteractionCreate, async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    const command = DiscordCommandsService.findByName(interaction.commandName);

    if (!command) {
      logger.warn(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      logger.error(`Error executing ${interaction.commandName}`, { error });
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      }
    }
  });
};
