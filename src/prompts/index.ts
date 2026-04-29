import { S3Client } from 'bun';
import { env } from '../environment';
import { getLogger } from '@logtape/logtape';

const logger = getLogger(['OpenBorys', 'Discord', 'Prompts']);

export async function loadPrompts() {
  logger.info('Loading prompts from block storage...');
  const {AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_ENDPOINT_URL_S3, AWS_REGION, AWS_BUCKET, PROMPTS_PREFIX} = env();
  const s3 = new S3Client({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    endpoint: AWS_ENDPOINT_URL_S3,
    region: AWS_REGION,
    bucket: AWS_BUCKET,
  });

  const list = await s3.list({ prefix: PROMPTS_PREFIX });

  const prompts = await Promise.all(
    (list.contents ?? []).map(async (obj) => {
      const key = obj.key;
      const contents = await s3.file(key).text();
      return `<${key}>${contents}</${key}>`;
    }),
  );

  return prompts.join('\n');
}
