import type {
  ModelPricing,
  ProviderModel,
} from '../../../services/providers/types';

export type ModelChoice = {
  name: string;
  value: string;
};

const MAX_CHOICES = 25;
const MAX_NAME_LENGTH = 100;

export const formatUsdPerM = (value: number): string => {
  const rounded = Number(value.toFixed(3));
  return `$${rounded}/M`;
};

const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 1)}…`;
};

const priceSuffix = (pricing: ModelPricing): string => {
  const priceIn = formatUsdPerM(pricing.promptUsdPerM);
  const priceOut = formatUsdPerM(pricing.completionUsdPerM);
  return ` · ${priceIn} in · ${priceOut} out`;
};

const choiceName = (model: ProviderModel): string => {
  const suffix = model.pricing === null ? '' : priceSuffix(model.pricing);
  return truncate(`${model.name}${suffix}`, MAX_NAME_LENGTH);
};

const matchesQuery = (model: ProviderModel, query: string): boolean => {
  return (
    model.id.toLowerCase().includes(query) ||
    model.name.toLowerCase().includes(query)
  );
};

export const buildModelChoices = (
  models: ProviderModel[],
  query: string,
): ModelChoice[] => {
  const normalized = query.toLowerCase();
  return models
    .filter((model) => matchesQuery(model, normalized))
    .slice(0, MAX_CHOICES)
    .map((model) => ({ name: choiceName(model), value: model.id }));
};
