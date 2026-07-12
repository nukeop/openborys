import { describe, expect, it } from 'bun:test';
import type { ProviderModel } from '../../../services/providers/types';
import { buildModelChoices, formatUsdPerM } from './model-choices';

const pricedModels: ProviderModel[] = [
  {
    id: 'deepseek/deepseek-v4-flash',
    name: 'DeepSeek: DeepSeek V4 Flash',
    pricing: { promptUsdPerM: 0.077, completionUsdPerM: 0.154 },
  },
  {
    id: 'verbose-lab/model-with-an-extremely-long-name',
    name: `Verbose Lab: ${'Very '.repeat(20)}Long Model Name`,
    pricing: { promptUsdPerM: 12, completionUsdPerM: 48 },
  },
  ...Array.from({ length: 30 }, (_, index) => ({
    id: `filler/model-${index}`,
    name: `Filler: Model ${index}`,
    pricing: { promptUsdPerM: 1, completionUsdPerM: 2 },
  })),
];

const unpricedModels: ProviderModel[] = [
  { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5', pricing: null },
  { id: 'claude-opus-4-1', name: 'Claude Opus 4.1', pricing: null },
];

describe('buildModelChoices', () => {
  it('includes formatted prices in the name and the raw id in the value', () => {
    const choices = buildModelChoices(pricedModels, 'deepseek');

    expect(choices).toEqual([
      {
        name: 'DeepSeek: DeepSeek V4 Flash · $0.077/M in · $0.154/M out',
        value: 'deepseek/deepseek-v4-flash',
      },
    ]);
  });

  it('renders unpriced models without a price suffix', () => {
    const choices = buildModelChoices(unpricedModels, 'opus');

    expect(choices).toEqual([
      { name: 'Claude Opus 4.1', value: 'claude-opus-4-1' },
    ]);
  });

  it('caps the result at 25 choices', () => {
    const choices = buildModelChoices(pricedModels, '');

    expect(choices.length).toBe(25);
  });

  it('filters by model id', () => {
    const choices = buildModelChoices(pricedModels, 'model-7');

    expect(choices).toEqual([
      {
        name: 'Filler: Model 7 · $1/M in · $2/M out',
        value: 'filler/model-7',
      },
    ]);
  });

  it('filters by model name', () => {
    const choices = buildModelChoices(pricedModels, 'verbose lab:');

    expect(choices.map((choice) => choice.value)).toEqual([
      'verbose-lab/model-with-an-extremely-long-name',
    ]);
  });

  it('truncates names longer than the 100-character Discord limit', () => {
    const choices = buildModelChoices(pricedModels, 'verbose');

    expect(choices.map((choice) => choice.name.length)).toEqual([100]);
  });
});

describe('formatUsdPerM', () => {
  it('formats whole-dollar prices without decimals', () => {
    expect(formatUsdPerM(3)).toBe('$3/M');
  });

  it('formats sub-dollar prices without float noise', () => {
    const perTokenPrice = Number.parseFloat('0.00000027');
    expect(formatUsdPerM(perTokenPrice * 1_000_000)).toBe('$0.27/M');
  });

  it('keeps sub-cent precision', () => {
    expect(formatUsdPerM(0.025)).toBe('$0.025/M');
  });

  it('formats free models as zero', () => {
    expect(formatUsdPerM(0)).toBe('$0/M');
  });
});
