import { anthropicProvider } from './anthropic';
import { openRouterProvider } from './openrouter';
import type { AiProvider, Provider } from './types';

const providers: Record<Provider, AiProvider> = {
  anthropic: anthropicProvider,
  openrouter: openRouterProvider,
};

export const getProvider = (id: Provider): AiProvider => providers[id];
