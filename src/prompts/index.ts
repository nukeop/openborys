import { S3Client } from 'bun';

const s3 = new S3Client({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  region: process.env.AWS_REGION,
  bucket: process.env.AWS_BUCKET,
});

export async function loadPrompts() {
  const prefix = process.env.PROMPTS_PREFIX!;
  const list = await s3.list({ prefix });

  const prompts = await Promise.all(
    (list.contents ?? [])?.map(async (obj) => {
      const key = obj.key;
      const contents = await s3.file(key).text();
      return `<${key}>${contents}</${key}>`;
    }),
  );

  return prompts.join('\n');
}
