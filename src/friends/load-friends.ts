import { getLogger } from '@logtape/logtape';
import { S3Client } from 'bun';
import { env } from '../environment';
import { friendSchema } from './schemas';
import type { Friend } from './types';

const logger = getLogger(['OpenBorys', 'Discord', 'Friends']);

export async function loadFriends(): Promise<Friend[]> {
  logger.info('Loading friends from block storage...');
  const {
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_ENDPOINT_URL_S3,
    AWS_REGION,
    AWS_BUCKET,
    FRIENDS_PREFIX,
  } = env();
  const s3 = new S3Client({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    endpoint: AWS_ENDPOINT_URL_S3,
    region: AWS_REGION,
    bucket: AWS_BUCKET,
  });

  const list = await s3.list({ prefix: FRIENDS_PREFIX });

  const friends = await Promise.all(
    (list.contents ?? []).map(async (obj) => {
      const key = obj.key;
      const raw = await s3.file(key).json();
      const parsed = friendSchema.parse(raw);
      return parsed as Friend;
    }),
  );

  logger.info('Loaded {count} friends', { count: friends.length });
  return friends;
}
