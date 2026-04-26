import { anthropic } from '@ai-sdk/anthropic';
import { getLogger } from '@logtape/logtape';
import { generateText, type LanguageModel, streamText } from 'ai';

const logger = getLogger(['OpenBorys', 'Service', 'AI']);

export type Provider = 'anthropic';

const factories: Record<Provider, (model: string) => LanguageModel> = {
  anthropic,
};

let activeProvider: Provider = 'anthropic';
let activeModelName = 'claude-sonnet-4-6';
let activeModel: LanguageModel = factories[activeProvider](activeModelName);

export const setActive = (provider: Provider, model: string): void => {
  activeProvider = provider;
  activeModelName = model;
  activeModel = factories[provider](model);
};

export const getActive = (): { provider: Provider; model: string } => ({
  provider: activeProvider,
  model: activeModelName,
});

type GenerateArgs = Omit<Parameters<typeof generateText>[0], 'model'>;
type StreamArgs = Omit<Parameters<typeof streamText>[0], 'model'>;

export const ai = {
  setActive,
  getActive,
  generateText: (args: GenerateArgs) => {
    logger.info('Generating text...');
    return generateText({ ...args, model: activeModel } as Parameters<
      typeof generateText
    >[0]);
  },
  streamText: (args: StreamArgs) => {
    logger.info('Streaming text...');
    return streamText({ ...args, model: activeModel } as Parameters<
      typeof streamText
    >[0]);
  },
};
