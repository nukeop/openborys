import { openai } from '@ai-sdk/openai';
import { getLogger } from '@logtape/logtape';
import { QdrantClient } from '@qdrant/js-client-rest';
import { embed } from 'ai';
import { env } from '../environment';

const logger = getLogger(['OpenBorys', 'Service', 'Embeddings']);

export class EmbeddingsService {
  static #client: QdrantClient;

  private constructor() {}

  static client(): QdrantClient {
    if (!EmbeddingsService.#client) {
      EmbeddingsService.#client = new QdrantClient({
        url: env().QDRANT_URL,
        apiKey: env().QDRANT_API_KEY,
      });
    }

    return EmbeddingsService.#client;
  }

  static async embedding(text: string) {
    logger.debug('Generating embedding...', { text });
    const result = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: text,
    });
    return result.embedding;
  }

  static async saveEmbedding(text: string) {
    const embedding = await EmbeddingsService.embedding(text);

    logger.info('Saving embedding to Qdrant...', { text });
    await EmbeddingsService.client().upsert(env().QDRANT_COLLECTION, {
      points: [
        {
          id: crypto.randomUUID(),
          vector: embedding,
          payload: {
            'bot-id': env().QDRANT_BOT_NAME,
            text,
            'created-at': new Date().toISOString(),
          },
        },
      ],
    });
  }
}
