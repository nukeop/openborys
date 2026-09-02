import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { env } from '../../environment';
import {
  type AiProvider,
  INPUT_MODALITIES,
  type InputModality,
  type ProviderModel,
} from './types';

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
  architecture: {
    input_modalities: string[];
  };
};

type OpenRouterModelsResponse = {
  data: OpenRouterApiModel[];
};

const KNOWN_INPUT_MODALITIES: ReadonlySet<string> = new Set(INPUT_MODALITIES);

const isKnownInputModality = (modality: string): modality is InputModality =>
  KNOWN_INPUT_MODALITIES.has(modality);

const toKnownInputModalities = (modalities: string[]): InputModality[] =>
  modalities.filter(isKnownInputModality);

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
  inputModalities: toKnownInputModalities(raw.architecture.input_modalities),
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
  defaultModel: {
    id: 'anthropic/claude-haiku-4.5',
    inputModalities: ['text', 'image'],
  },
  createModel: (model) =>
    createOpenRouter({ apiKey: env().OPENROUTER_API_KEY }).chat(model),
  listModels: fetchModels,
};
