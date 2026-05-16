type GptImage2Input = {
  prompt: string;
  input_images?: string[];
  aspect_ratio?: '1:1' | '3:2' | '2:3';
  quality?: 'low' | 'medium' | 'high' | 'auto';
  output_format?: 'webp' | 'png' | 'jpeg';
  background?: 'auto' | 'opaque';
  moderation?: 'auto' | 'low';
  number_of_images?: number;
};

type NanoBanana2Input = {
  prompt: string;
  image_input?: string[];
  aspect_ratio?:
    | '1:1'
    | '2:3'
    | '3:2'
    | '3:4'
    | '4:3'
    | '4:5'
    | '5:4'
    | '9:16'
    | '16:9'
    | '21:9'
    | '1:4'
    | '4:1'
    | '1:8'
    | '8:1'
    | 'match_input_image';
  resolution?: '512px' | '1K' | '2K' | '4K';
  output_format?: 'jpg' | 'png';
};

type ImageModelConfig<T> = {
  replicateId: `${string}/${string}`;
  defaults: Partial<T>;
};

export const modelConfig = {
  'gpt-image-2': {
    replicateId: 'openai/gpt-image-2',
    defaults: {
      quality: 'low',
      output_format: 'jpeg',
      moderation: 'low',
    },
  },
  'nano-banana-2': {
    replicateId: 'google/nano-banana-2',
    defaults: {
      resolution: '1K',
      output_format: 'jpg',
    },
  },
} as const satisfies {
  'gpt-image-2': ImageModelConfig<GptImage2Input>;
  'nano-banana-2': ImageModelConfig<NanoBanana2Input>;
};

export type ImageModelName = keyof typeof modelConfig;
