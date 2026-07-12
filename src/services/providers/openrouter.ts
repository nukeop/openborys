import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { env } from '../../environment';
import type { AiProvider, ProviderModel } from './types';

const MODELS_URL =
  'https://openrouter.ai/api/v1/models?sort=top-weekly&supported_parameters=tools';

const USD_PER_TOKEN_TO_USD_PER_MILLION = 1_000_000;

type OpenRouterApiModel = {
  id: string;
  name: string;
  pricing: {
    prompt: string;
    completion: string;
  };
};

type OpenRouterModelsResponse = {
  data: OpenRouterApiModel[];
};

export const toProviderModel = (raw: OpenRouterApiModel): ProviderModel => ({
  id: raw.id,
  name: raw.name,
  pricing: {
    promptUsdPerM:
      Number.parseFloat(raw.pricing.prompt) * USD_PER_TOKEN_TO_USD_PER_MILLION,
    completionUsdPerM:
      Number.parseFloat(raw.pricing.completion) *
      USD_PER_TOKEN_TO_USD_PER_MILLION,
  },
});

const fetchModels = async (): Promise<ProviderModel[]> => {
  const response = await fetch(MODELS_URL);

  if (!response.ok) {
    throw new Error(`OpenRouter models API returned ${response.status}`);
  }

  const body = (await response.json()) as OpenRouterModelsResponse;
  return body.data.map(toProviderModel);
};

export const openRouterProvider: AiProvider = {
  defaultModel: 'anthropic/claude-haiku-4.5',
  createModel: (model) =>
    createOpenRouter({ apiKey: env().OPENROUTER_API_KEY }).chat(model),
  listModels: fetchModels,
};
