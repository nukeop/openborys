import {
  type GptImage25Input,
  type ImageModelName,
  modelConfig,
  type NanoBanana2Input,
} from './config';

type ReplicatePayload = {
  'gpt-image-2.5-flare': GptImage25Input;
  'gpt-image-2.5-sunburst': GptImage25Input;
  'nano-banana-2': NanoBanana2Input;
};

export const buildPayload = <Name extends ImageModelName>(
  modelName: Name,
  prompt: string,
  imageUrls: string[] | undefined,
  botOptions: Record<string, string> | undefined,
): ReplicatePayload[Name] => {
  const config = modelConfig[modelName];

  const defaults = Object.fromEntries(
    config.options.map((option) => [option.name, option.default]),
  );

  const imageField =
    imageUrls && imageUrls.length > 0
      ? { [config.imageInputField]: imageUrls }
      : {};

  return {
    ...defaults,
    ...(botOptions ?? {}),
    ...imageField,
    ...(config.fixedFields ?? {}),
    prompt,
  } as ReplicatePayload[Name];
};
