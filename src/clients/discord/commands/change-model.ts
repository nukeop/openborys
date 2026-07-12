import { getLogger } from '@logtape/logtape';
import { SlashCommandBuilder } from 'discord.js';
import { ActiveModelsService } from '../../../services/active-models';
import { getProvider } from '../../../services/providers';
import type { Command } from '../types';
import { buildModelChoices } from './model-choices';

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
    const query = interaction.options.getFocused();
    const { provider } = ActiveModelsService.get('main');
    const models = await getProvider(provider).listModels();

    await interaction.respond(buildModelChoices(models, query));
  },

  execute: async (interaction) => {
    const model = interaction.options.getString('model', true);
    const previous = ActiveModelsService.get('main');

    await ActiveModelsService.setModel('main', model);

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
