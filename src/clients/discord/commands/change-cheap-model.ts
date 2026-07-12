import { getLogger } from '@logtape/logtape';
import { SlashCommandBuilder } from 'discord.js';
import { ActiveModelsService } from '../../../services/active-models';
import { getProvider } from '../../../services/providers';
import type { Command } from '../types';
import { buildModelChoices } from './model-choices';

const logger = getLogger([
  'OpenBorys',
  'Discord',
  'Commands',
  'ChangeCheapModel',
]);

export const changeCheapModelCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('change-cheap-model')
    .setDescription(
      'Change the cheap AI model (reply decisions, cheap object generation)',
    )
    .addStringOption((option) =>
      option
        .setName('model')
        .setDescription('Model to switch to')
        .setRequired(true)
        .setAutocomplete(true),
    ),

  autocomplete: async (interaction) => {
    const query = interaction.options.getFocused();
    const { provider } = ActiveModelsService.get('cheap');
    const models = await getProvider(provider).listModels();

    await interaction.respond(buildModelChoices(models, query));
  },

  execute: async (interaction) => {
    const model = interaction.options.getString('model', true);
    const previous = ActiveModelsService.get('cheap');

    await ActiveModelsService.setModel('cheap', model);

    logger.info('Cheap model changed from {previous} to {model} by {user}', {
      previous: previous.model,
      model,
      user: interaction.user.tag,
    });

    await interaction.reply({
      content: `Cheap model changed: **${previous.model}** → **${model}**`,
      ephemeral: true,
    });
  },
};
