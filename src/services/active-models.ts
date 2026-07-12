import { getLogger } from '@logtape/logtape';
import { z } from 'zod';
import { env } from '../environment';
import { getProvider } from './providers';
import { PROVIDER_IDS, type Provider } from './providers/types';
import { RedisService } from './redis';

const logger = getLogger(['OpenBorys', 'Service', 'ActiveModels']);

const modelSelectionSchema = z.object({
  provider: z.enum(PROVIDER_IDS),
  model: z.string().min(1),
});

const tierStateSchema = z.object({
  main: modelSelectionSchema,
  cheap: modelSelectionSchema,
});

export type ModelSelection = z.infer<typeof modelSelectionSchema>;

type TierState = z.infer<typeof tierStateSchema>;

export type Tier = keyof TierState;

function defaultSelection(): ModelSelection {
  return {
    provider: 'anthropic',
    model: getProvider('anthropic').defaultModel,
  };
}

function defaultState(): TierState {
  return {
    main: defaultSelection(),
    cheap: defaultSelection(),
  };
}

function redisKey(): string {
  return `active_models:${env().BOT_NAME}`;
}

export class ActiveModelsService {
  static #state: TierState = defaultState();

  private constructor() {}

  static reset(): void {
    ActiveModelsService.#state = defaultState();
  }

  static get(tier: Tier): ModelSelection {
    const { provider, model } = ActiveModelsService.#state[tier];
    return { provider, model };
  }

  static async setModel(tier: Tier, model: string): Promise<void> {
    ActiveModelsService.#state[tier].model = model;
    await ActiveModelsService.#persist();
  }

  static async setProvider(tier: Tier, provider: Provider): Promise<void> {
    const selection = ActiveModelsService.#state[tier];
    selection.provider = provider;
    selection.model = getProvider(provider).defaultModel;
    await ActiveModelsService.#persist();
  }

  static async load(): Promise<void> {
    const raw = await RedisService.client().get(redisKey());
    if (!raw) {
      return;
    }

    try {
      ActiveModelsService.#state = tierStateSchema.parse(JSON.parse(raw));
    } catch (error) {
      logger.error(
        'Persisted model selection is invalid, keeping defaults: {message}',
        {
          message: error instanceof Error ? error.message : String(error),
        },
      );
    }
  }

  static async #persist(): Promise<void> {
    await RedisService.client().set(
      redisKey(),
      JSON.stringify(ActiveModelsService.#state),
    );
  }
}
