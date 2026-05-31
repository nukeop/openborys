import { anthropic } from '@ai-sdk/anthropic';
import { getLogger } from '@logtape/logtape';
import {
  generateText,
  type LanguageModel,
  type ModelMessage,
  Output,
  type Schema,
  streamText,
} from 'ai';
import { ToolService, type ToolWithMeta, toAITools } from './tools';

const logger = getLogger(['OpenBorys', 'Service', 'AI']);

export type Provider = 'anthropic';

const factories: Record<Provider, (model: string) => LanguageModel> = {
  anthropic,
};

let activeProvider: Provider = 'anthropic';
let activeModelName = 'claude-haiku-4-5';
let activeModel: LanguageModel = factories[activeProvider](activeModelName);

const cheapModel: LanguageModel = anthropic('claude-haiku-4-5');

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
  generateText: (args: GenerateArgs, extraTools?: ToolWithMeta<any, any>[]) => {
    logger.info('Generating text...');
    return generateText({
      ...args,
      tools: toAITools([
        ...ToolService.getAlwaysAvailableTools(),
        ...(extraTools ?? []),
      ]),
      model: activeModel,
      allowSystemInMessages: true,
    } as Parameters<typeof generateText>[0]);
  },
  generateTextRaw: (args: GenerateArgs) => {
    logger.info('Generating text (raw)...');
    return generateText({
      ...args,
      model: activeModel,
      allowSystemInMessages: true,
    } as Parameters<typeof generateText>[0]);
  },
  streamText: (args: StreamArgs, extraTools?: ToolWithMeta<any, any>[]) => {
    logger.info('Streaming text...');
    return streamText({
      ...args,
      tools: toAITools([
        ...ToolService.getAlwaysAvailableTools(),
        ...(extraTools ?? []),
      ]),
      model: activeModel,
      allowSystemInMessages: true,
    } as Parameters<typeof streamText>[0]);
  },
  generateCheapObject: async <OBJECT>(
    messages: ModelMessage[],
    schema: Schema<OBJECT>,
  ): Promise<OBJECT> => {
    logger.info('Generating cheap object...');
    const result = await generateText({
      messages,
      output: Output.object({ schema }),
      model: cheapModel,
      allowSystemInMessages: true,
    });
    return result.output;
  },
};
