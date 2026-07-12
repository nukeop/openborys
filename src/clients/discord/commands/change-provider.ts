import { getLogger } from '@logtape/logtape';
import { SlashCommandBuilder } from 'discord.js';
import { z } from 'zod';
import {
  ActiveModelsService,
  type Tier,
} from '../../../services/active-models';
import { PROVIDER_IDS } from '../../../services/providers/types';
import type { Command } from '../types';

const providerOptionSchema = z.enum(PROVIDER_IDS);

const logger = getLogger([
  'OpenBorys',
  'Discord',
  'Commands',
  'ChangeProvider',
]);

export const createProviderCommand = (
  tier: Tier,
  name: string,
  description: string,
): Command => ({
  data: new SlashCommandBuilder()
    .setName(name)
    .setDescription(description)
    .addStringOption((option) =>
      option
        .setName('provider')
        .setDescription('Provider to switch to')
        .setRequired(true)
        .addChoices(
          { name: 'Anthropic', value: 'anthropic' },
          { name: 'OpenRouter', value: 'openrouter' },
        ),
    ),

  execute: async (interaction) => {
    const provider = providerOptionSchema.parse(
      interaction.options.getString('provider', true),
    );
    const previous = ActiveModelsService.get(tier);

    await ActiveModelsService.setProvider(tier, provider);
    const current = ActiveModelsService.get(tier);

    logger.info(
      'Provider ({tier}) changed from {previous} to {provider} by {user}',
      {
        tier,
        previous: previous.provider,
        provider,
        user: interaction.user.tag,
      },
    );

    await interaction.reply({
      content: `Provider changed: **${previous.provider}** → **${current.provider}** (model reset to **${current.model}**)`,
      ephemeral: true,
    });
  },
});

export const changeProviderCommand = createProviderCommand(
  'main',
  'change-provider',
  'Change the active AI provider',
);
