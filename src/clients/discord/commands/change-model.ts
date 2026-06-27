import { getLogger } from '@logtape/logtape';
import { SlashCommandBuilder } from 'discord.js';
import { ai } from '../../../services/ai';
import { getAvailableModels } from '../../../services/anthropic-models';
import type { Command } from '../types';

const logger = getLogger(['OpenBorys', 'Discord', 'Commands', 'ChangeModel']);

export const changeModelCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('change-model')
    .setDescription('Change the active AI model')
    .addStringOption((option) =>
      option
        .setName('model')
        .setDescription('Model to switch to')
        .setRequired(true)
        .setAutocomplete(true),
    ),

  autocomplete: async (interaction) => {
    const query = interaction.options.getFocused().toLowerCase();
    const models = await getAvailableModels();

    const choices = models
      .filter(
        (m) =>
          m.id.toLowerCase().includes(query) ||
          m.display_name.toLowerCase().includes(query),
      )
      .map((m) => ({ name: m.display_name, value: m.id }));

    await interaction.respond(choices);
  },

  execute: async (interaction) => {
    const model = interaction.options.getString('model', true);
    const previous = ai.getActive();

    ai.setActive('anthropic', model);

    logger.info('Model changed from {previous} to {model} by {user}', {
      previous: previous.model,
      model,
      user: interaction.user.tag,
    });

    await interaction.reply({
      content: `Model changed: **${previous.model}** → **${model}**`,
      ephemeral: true,
    });
  },
};
