import { getLogger } from '@logtape/logtape';
import { z } from 'zod';
import { env } from '../environment';
import { getProvider } from './providers';
import { type ModelRef, PROVIDER_IDS, type Provider } from './providers/types';
import { RedisService } from './redis';

const logger = getLogger(['OpenBorys', 'Service', 'ActiveModels']);

const modelSelectionSchema = z.object({
  provider: z.enum(PROVIDER_IDS),
  model: z.string().min(1),
  inputModalities: z.array(z.string()).default(['text', 'image']),
});

const tierStateSchema = z.object({
  main: modelSelectionSchema,
  cheap: modelSelectionSchema,
});

export type ModelSelection = z.infer<typeof modelSelectionSchema>;

type TierState = z.infer<typeof tierStateSchema>;

export type Tier = keyof TierState;

function defaultSelection(): ModelSelection {
  const { id, inputModalities } = getProvider('anthropic').defaultModel;
  return {
    provider: 'anthropic',
    model: id,
    inputModalities,
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
    const { provider, model, inputModalities } =
      ActiveModelsService.#state[tier];
    return { provider, model, inputModalities };
  }

  static async setModel(tier: Tier, model: ModelRef): Promise<void> {
    const selection = ActiveModelsService.#state[tier];
    selection.model = model.id;
    selection.inputModalities = model.inputModalities;
    await ActiveModelsService.#persist();
  }

  static async setProvider(tier: Tier, provider: Provider): Promise<void> {
    const selection = ActiveModelsService.#state[tier];
    const { id, inputModalities } = getProvider(provider).defaultModel;
    selection.provider = provider;
    selection.model = id;
    selection.inputModalities = inputModalities;
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
