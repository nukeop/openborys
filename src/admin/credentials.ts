import { getLogger } from '@logtape/logtape';
import { S3Client } from 'bun';
import z from 'zod';
import { env } from '../environment';

const logger = getLogger(['OpenBorys', 'admin', 'credentials']);

const credentialSchema = z.object({
  username: z.string().min(1),
  passwordHash: z.string().min(1),
});

export type AdminCredential = z.infer<typeof credentialSchema>;

export class CredentialsService {
  static #byUsername: Map<string, AdminCredential> = new Map();

  private constructor() {}

  static async load(): Promise<void> {
    logger.info('Loading admin credentials from block storage...');
    const {
      AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY,
      AWS_ENDPOINT_URL_S3,
      AWS_REGION,
      AWS_BUCKET,
      ADMIN_USERS_PREFIX,
    } = env();
    const s3 = new S3Client({
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
      endpoint: AWS_ENDPOINT_URL_S3,
      region: AWS_REGION,
      bucket: AWS_BUCKET,
    });

    const list = await s3.list({ prefix: ADMIN_USERS_PREFIX });

    const entries = await Promise.all(
      (list.contents ?? []).map(async (obj) => {
        const raw = await s3.file(obj.key).json();
        return credentialSchema.parse(raw);
      }),
    );

    CredentialsService.#byUsername = new Map(
      entries.map((entry) => [entry.username, entry]),
    );

    logger.info('Loaded {count} admin credentials', {
      count: CredentialsService.#byUsername.size,
    });
  }

  static async verify(username: string, password: string): Promise<boolean> {
    const credential = CredentialsService.#byUsername.get(username);
    if (!credential) {
      return false;
    }
    return Bun.password.verify(password, credential.passwordHash);
  }

  static count(): number {
    return CredentialsService.#byUsername.size;
  }
}
