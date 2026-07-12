import type { LanguageModel } from 'ai';

export const PROVIDER_IDS = ['anthropic', 'openrouter'] as const;

export type Provider = (typeof PROVIDER_IDS)[number];

export type ModelPricing = {
  promptUsdPerM: number;
  completionUsdPerM: number;
};

export type ProviderModel = {
  id: string;
  name: string;
  pricing: ModelPricing | null;
};

export type AiProvider = {
  defaultModel: string;
  createModel: (model: string) => LanguageModel;
  listModels: () => Promise<ProviderModel[]>;
};
