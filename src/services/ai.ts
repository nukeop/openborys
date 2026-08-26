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
import type { Provider } from './providers/types';
import { ToolService, type ToolWithMeta, toAITools } from './tools';

const logger = getLogger(['OpenBorys', 'Service', 'AI']);

const resolveModel = (
  tier: Tier,
): { provider: Provider; model: LanguageModel } => {
  const { provider, model } = ActiveModelsService.get(tier);
  return { provider, model: getProvider(provider).createModel(model) };
};

const toolsForProvider = (
  provider: Provider,
  extraTools?: ToolWithMeta<any, any>[],
) =>
  toAITools(
    [...ToolService.getAlwaysAvailableTools(), ...(extraTools ?? [])].filter(
      (tool) => !tool.provider || tool.provider === provider,
    ),
  );

type GenerateArgs = Omit<Parameters<typeof generateText>[0], 'model'>;
type StreamArgs = Omit<Parameters<typeof streamText>[0], 'model'>;

export const ai = {
  generateText: (args: GenerateArgs, extraTools?: ToolWithMeta<any, any>[]) => {
    const { provider, model } = resolveModel('main');
    logger.info('Generating text...');
    return generateText({
      ...args,
      tools: toolsForProvider(provider, extraTools),
      model,
      allowSystemInMessages: true,
    } as Parameters<typeof generateText>[0]);
  },
  generateTextRaw: (args: GenerateArgs) => {
    const { model } = resolveModel('main');
    logger.info('Generating text (raw)...');
    return generateText({
      ...args,
      model,
      allowSystemInMessages: true,
    } as Parameters<typeof generateText>[0]);
  },
  streamText: (args: StreamArgs, extraTools?: ToolWithMeta<any, any>[]) => {
    const { provider, model } = resolveModel('main');
    logger.info('Streaming text...');
    return streamText({
      ...args,
      tools: toolsForProvider(provider, extraTools),
      model,
      allowSystemInMessages: true,
    } as Parameters<typeof streamText>[0]);
  },
  generateCheapObject: async <OBJECT>(
    messages: ModelMessage[],
    schema: Schema<OBJECT>,
    signal?: AbortSignal,
  ): Promise<OBJECT> => {
    const { model } = resolveModel('cheap');
    logger.info('Generating cheap object...');
    const result = await generateText({
      messages,
      output: Output.object({ schema }),
      model,
      allowSystemInMessages: true,
      abortSignal: signal,
    });
    return result.output;
  },
};
