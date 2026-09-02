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
  inputModalities: string[];
};

export type ModelRef = Pick<ProviderModel, 'id' | 'inputModalities'>;

export type AiProvider = {
  defaultModel: ModelRef;
  createModel: (model: string) => LanguageModel;
  listModels: () => Promise<ProviderModel[]>;
};
