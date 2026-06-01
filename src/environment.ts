import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  DISCORD_TOKEN: z.string().min(1),
  DISCORD_CLIENT_ID: z.string().min(1),

  ANTHROPIC_API_KEY: z.string().min(1),

  REDIS_URL: z.url(),

  REPLICATE_API_TOKEN: z.string().min(1),
  TAVILY_API_KEY: z.string().min(1),

  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_ENDPOINT_URL_S3: z.url(),
  AWS_REGION: z.string().min(1).default('auto'),
  AWS_BUCKET: z.string().min(1),

  PROMPTS_PREFIX: z.string().min(1).default('prompts/'),
  FRIENDS_PREFIX: z.string().min(1).default('friends/'),
  TOOL_STRINGS_PREFIX: z.string().min(1).default('tool-strings/'),
  PLUGINS_PREFIX: z.string().min(1).default('plugins/'),

  TZ: z.string().min(1).default('UTC'),

  QDRANT_API_KEY: z.string().min(1),
  QDRANT_URL: z.url(),
  QDRANT_COLLECTION: z.string().min(1),
  QDRANT_BOT_NAME: z.string().min(1),

  OPENAI_API_KEY: z.string().min(1),
  BOT_NAME: z.string().min(1),

  DASHBOARD_PWD: z.string().min(1),
});

export type Environment = z.infer<typeof envSchema>;

let cached: Environment | null = null;

export const loadEnvironment = (): Environment => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(
      `Invalid environment variables:\n${z.prettifyError(parsed.error)}`,
    );
  }

  cached = parsed.data;
  return cached;
};

export const env = (): Environment => {
  if (!cached) {
    throw new Error(
      'Environment accessed before loadEnvironment() was called. Make sure init runs first.',
    );
  }
  return cached;
};

export const isProd = (): boolean => env().NODE_ENV === 'production';
