import { describe, expect, it } from 'bun:test';
import { toProviderModel } from './openrouter';

describe('toProviderModel', () => {
  it('converts per-token string prices to USD per million tokens', () => {
    const model = toProviderModel({
      id: 'openai/gpt-5.6-luna-pro',
      name: 'OpenAI: GPT-5.6 Luna Pro',
      pricing: { prompt: '0.000001', completion: '0.000006' },
    });

    expect(model).toEqual({
      id: 'openai/gpt-5.6-luna-pro',
      name: 'OpenAI: GPT-5.6 Luna Pro',
      pricing: { promptUsdPerM: 1, completionUsdPerM: 6 },
    });
  });

  it('maps free models to zero prices', () => {
    const model = toProviderModel({
      id: 'tencent/hy3:free',
      name: 'Tencent: HY3 (free)',
      pricing: { prompt: '0', completion: '0' },
    });

    expect(model.pricing).toEqual({
      promptUsdPerM: 0,
      completionUsdPerM: 0,
    });
  });
});
