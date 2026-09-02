import { beforeEach, describe, expect, it, mock, spyOn } from 'bun:test';
import { RedisService } from './redis';

const mockClient = {
  get: mock(),
  set: mock(),
};

spyOn(RedisService, 'client').mockReturnValue(mockClient as any);

mock.module('../environment', () => ({
  env: () => ({ BOT_NAME: 'testbot' }),
}));

// Import after mocks are set up
const { ActiveModelsService } = await import('./active-models');

const REDIS_KEY = 'active_models:testbot';

describe('ActiveModelsService', () => {
  beforeEach(() => {
    mockClient.get.mockReset();
    mockClient.set.mockReset();
    ActiveModelsService.reset();
  });

  describe('get', () => {
    it('returns Anthropic defaults for both tiers before anything is set', () => {
      const main = ActiveModelsService.get('main');
      const cheap = ActiveModelsService.get('cheap');

      expect(main).toEqual({
        provider: 'anthropic',
        model: 'claude-haiku-4-5',
        inputModalities: ['text', 'image'],
      });
      expect(cheap).toEqual({
        provider: 'anthropic',
        model: 'claude-haiku-4-5',
        inputModalities: ['text', 'image'],
      });
    });
  });

  describe('setModel', () => {
    it('changes only the specified tier, leaving the other untouched', async () => {
      await ActiveModelsService.setModel('main', {
        id: 'claude-sonnet-4-20250514',
        inputModalities: ['text', 'image'],
      });

      const main = ActiveModelsService.get('main');
      const cheap = ActiveModelsService.get('cheap');

      expect(main).toEqual({
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        inputModalities: ['text', 'image'],
      });
      expect(cheap).toEqual({
        provider: 'anthropic',
        model: 'claude-haiku-4-5',
        inputModalities: ['text', 'image'],
      });
    });

    it('persists the state to Redis', async () => {
      await ActiveModelsService.setModel('main', {
        id: 'claude-sonnet-4-20250514',
        inputModalities: ['text', 'image'],
      });

      expect(mockClient.set).toHaveBeenCalledWith(
        REDIS_KEY,
        expect.any(String),
      );

      const persisted = JSON.parse(mockClient.set.mock.calls[0]![1]);
      expect(persisted.main.model).toBe('claude-sonnet-4-20250514');
      expect(persisted.cheap.model).toBe('claude-haiku-4-5');
    });
  });

  describe('setProvider', () => {
    it('switches the provider and resets the model to that provider default', async () => {
      await ActiveModelsService.setProvider('cheap', 'openrouter');

      const cheap = ActiveModelsService.get('cheap');

      expect(cheap).toEqual({
        provider: 'openrouter',
        model: 'anthropic/claude-haiku-4.5',
        inputModalities: ['text', 'image'],
      });
    });

    it('does not affect the other tier', async () => {
      await ActiveModelsService.setProvider('cheap', 'openrouter');

      const main = ActiveModelsService.get('main');

      expect(main).toEqual({
        provider: 'anthropic',
        model: 'claude-haiku-4-5',
        inputModalities: ['text', 'image'],
      });
    });

    it('persists the state to Redis', async () => {
      await ActiveModelsService.setProvider('cheap', 'openrouter');

      expect(mockClient.set).toHaveBeenCalledWith(
        REDIS_KEY,
        expect.any(String),
      );

      const persisted = JSON.parse(mockClient.set.mock.calls[0]![1]);
      expect(persisted.cheap).toEqual({
        provider: 'openrouter',
        model: 'anthropic/claude-haiku-4.5',
        inputModalities: ['text', 'image'],
      });
    });
  });

  describe('load', () => {
    it('restores state from Redis after setModel round-trip', async () => {
      await ActiveModelsService.setModel('main', {
        id: 'claude-sonnet-4-20250514',
        inputModalities: ['text', 'image'],
      });

      const serialized = mockClient.set.mock.calls[0]![1];
      mockClient.get.mockResolvedValue(serialized);

      ActiveModelsService.reset();
      await ActiveModelsService.load();

      const main = ActiveModelsService.get('main');
      expect(main).toEqual({
        provider: 'anthropic',
        model: 'claude-sonnet-4-20250514',
        inputModalities: ['text', 'image'],
      });
    });

    it('restores state from Redis after setProvider round-trip', async () => {
      await ActiveModelsService.setProvider('cheap', 'openrouter');

      const serialized = mockClient.set.mock.calls[0]![1];
      mockClient.get.mockResolvedValue(serialized);

      ActiveModelsService.reset();
      await ActiveModelsService.load();

      const cheap = ActiveModelsService.get('cheap');
      expect(cheap).toEqual({
        provider: 'openrouter',
        model: 'anthropic/claude-haiku-4.5',
        inputModalities: ['text', 'image'],
      });
    });

    it('keeps defaults when the persisted blob does not match the schema', async () => {
      mockClient.get.mockResolvedValue(
        JSON.stringify({ main: { provider: 'bogus', model: '' } }),
      );

      await ActiveModelsService.load();

      expect(ActiveModelsService.get('main')).toEqual({
        provider: 'anthropic',
        model: 'claude-haiku-4-5',
        inputModalities: ['text', 'image'],
      });
      expect(ActiveModelsService.get('cheap')).toEqual({
        provider: 'anthropic',
        model: 'claude-haiku-4-5',
        inputModalities: ['text', 'image'],
      });
    });

    it('keeps defaults when Redis key does not exist', async () => {
      mockClient.get.mockResolvedValue(null);

      await ActiveModelsService.load();

      expect(ActiveModelsService.get('main')).toEqual({
        provider: 'anthropic',
        model: 'claude-haiku-4-5',
        inputModalities: ['text', 'image'],
      });
      expect(ActiveModelsService.get('cheap')).toEqual({
        provider: 'anthropic',
        model: 'claude-haiku-4-5',
        inputModalities: ['text', 'image'],
      });
    });

    it('defaults a persisted blob with no inputModalities key to text and image', async () => {
      mockClient.get.mockResolvedValue(
        JSON.stringify({
          main: { provider: 'anthropic', model: 'claude-sonnet-4-20250514' },
          cheap: { provider: 'anthropic', model: 'claude-haiku-4-5' },
        }),
      );

      await ActiveModelsService.load();

      expect(ActiveModelsService.get('main').inputModalities).toEqual([
        'text',
        'image',
      ]);
    });
  });
});
