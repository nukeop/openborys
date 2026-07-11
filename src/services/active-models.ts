import { getLogger } from '@logtape/logtape';
import { z } from 'zod';
import { env } from '../environment';
import { RedisService } from './redis';

const logger = getLogger(['OpenBorys', 'Service', 'ActiveModels']);

const providerSchema = z.enum(['anthropic', 'openrouter']);

const modelSelectionSchema = z.object({
  provider: providerSchema,
  model: z.string().min(1),
});

const tierStateSchema = z.object({
  main: modelSelectionSchema,
  cheap: modelSelectionSchema,
});

export type Provider = z.infer<typeof providerSchema>;
export type ModelSelection = z.infer<typeof modelSelectionSchema>;

type TierState = z.infer<typeof tierStateSchema>;

export type Tier = keyof TierState;

const PROVIDER_DEFAULTS: Record<Provider, string> = {
  anthropic: 'claude-haiku-4-5',
  openrouter: 'anthropic/claude-haiku-4.5',
};

function defaultState(): TierState {
  return {
    main: { provider: 'anthropic', model: PROVIDER_DEFAULTS.anthropic },
    cheap: { provider: 'anthropic', model: PROVIDER_DEFAULTS.anthropic },
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
    selection.model = PROVIDER_DEFAULTS[provider];
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
