import { anthropic } from '@ai-sdk/anthropic';
import { env } from '../../environment';
import type { AiProvider, ProviderModel } from './types';

type AnthropicApiModel = {
  id: string;
  display_name: string;
};

type AnthropicModelsResponse = {
  data: AnthropicApiModel[];
};

const fetchModels = async (): Promise<ProviderModel[]> => {
  const response = await fetch('https://api.anthropic.com/v1/models', {
    headers: {
      'x-api-key': env().ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
  });

  if (!response.ok) {
    throw new Error(`Anthropic models API returned ${response.status}`);
  }

  const body = (await response.json()) as AnthropicModelsResponse;
  return body.data.map((model) => ({
    id: model.id,
    name: model.display_name,
    pricing: null,
  }));
};

export const anthropicProvider: AiProvider = {
  defaultModel: 'claude-haiku-4-5',
  createModel: (model) => anthropic(model),
  listModels: fetchModels,
};
