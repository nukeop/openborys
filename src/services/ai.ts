import { getLogger } from '@logtape/logtape';
import {
  generateText,
  type LanguageModel,
  type ModelMessage,
  Output,
  type Schema,
  streamText,
} from 'ai';
import { ActiveModelsService, type Tier } from './active-models';
import { getProvider } from './providers';
import { ToolService, type ToolWithMeta, toAITools } from './tools';

const logger = getLogger(['OpenBorys', 'Service', 'AI']);

const resolveModel = (tier: Tier): LanguageModel => {
  const { provider, model } = ActiveModelsService.get(tier);
  return getProvider(provider).createModel(model);
};

type GenerateArgs = Omit<Parameters<typeof generateText>[0], 'model'>;
type StreamArgs = Omit<Parameters<typeof streamText>[0], 'model'>;

export const ai = {
  generateText: (args: GenerateArgs, extraTools?: ToolWithMeta<any, any>[]) => {
    logger.info('Generating text...');
    return generateText({
      ...args,
      tools: toAITools([
        ...ToolService.getAlwaysAvailableTools(),
        ...(extraTools ?? []),
      ]),
      model: resolveModel('main'),
      allowSystemInMessages: true,
    } as Parameters<typeof generateText>[0]);
  },
  generateTextRaw: (args: GenerateArgs) => {
    logger.info('Generating text (raw)...');
    return generateText({
      ...args,
      model: resolveModel('main'),
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
      model: resolveModel('main'),
      allowSystemInMessages: true,
    } as Parameters<typeof streamText>[0]);
  },
  generateCheapObject: async <OBJECT>(
    messages: ModelMessage[],
    schema: Schema<OBJECT>,
    signal?: AbortSignal,
  ): Promise<OBJECT> => {
    logger.info('Generating cheap object...');
    const result = await generateText({
      messages,
      output: Output.object({ schema }),
      model: resolveModel('cheap'),
      allowSystemInMessages: true,
      abortSignal: signal,
    });
    return result.output;
  },
};
