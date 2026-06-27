import { getLogger } from '@logtape/logtape';
import { env } from '../environment';

const logger = getLogger(['OpenBorys', 'Service', 'AnthropicModels']);

export type AnthropicModel = {
  id: string;
  display_name: string;
};

type AnthropicModelsResponse = {
  data: AnthropicModel[];
};

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

let cachedModels: AnthropicModel[] = [];
let cacheTimestamp = 0;

const fetchModels = async (): Promise<AnthropicModel[]> => {
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
  return body.data;
};

export const getAvailableModels = async (): Promise<AnthropicModel[]> => {
  if (cachedModels.length > 0 && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return cachedModels;
  }

  try {
    cachedModels = await fetchModels();
    cacheTimestamp = Date.now();
  } catch (error) {
    logger.error('Failed to fetch Anthropic models: {message}', {
      message: error instanceof Error ? error.message : String(error),
    });
  }

  return cachedModels;
};
