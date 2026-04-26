import { S3Client } from 'bun';
import { env } from '../environment';

export async function loadPrompts() {
  const config = env();
  const s3 = new S3Client({
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
    endpoint: config.AWS_ENDPOINT_URL_S3,
    region: config.AWS_REGION,
    bucket: config.AWS_BUCKET,
  });

  const list = await s3.list({ prefix: config.PROMPTS_PREFIX });

  const prompts = await Promise.all(
    (list.contents ?? []).map(async (obj) => {
      const key = obj.key;
      const contents = await s3.file(key).text();
      return `<${key}>${contents}</${key}>`;
    }),
  );

  return prompts.join('\n');
}
