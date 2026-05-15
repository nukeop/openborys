import { openai } from '@ai-sdk/openai';
import { getLogger } from '@logtape/logtape';
import { QdrantClient } from '@qdrant/js-client-rest';
import { embed } from 'ai';
import { env } from '../environment';

const logger = getLogger(['OpenBorys', 'Service', 'Embeddings']);

type MemoryEmbedding = {
  'bot-id': string;
  text: string;
  'created-at': string;
};

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

  static async ensureIndexes(): Promise<void> {
    const collection = env().QDRANT_COLLECTION;
    await EmbeddingsService.client().createPayloadIndex(collection, {
      field_name: 'bot-id',
      field_schema: 'keyword',
      wait: true,
    });
    logger.info('Payload index on "bot-id" ensured for {collection}', {
      collection,
    });
  }

  static async search(query: string, limit = 5): Promise<string[]> {
    const vector = await EmbeddingsService.embedding(query);

    logger.info(
      'Searching Qdrant... (collection={collection}, bot={bot}, dims={dims}, limit={limit})',
      {
        collection: env().QDRANT_COLLECTION,
        bot: env().QDRANT_BOT_NAME,
        dims: vector.length,
        limit,
      },
    );

    const results = await EmbeddingsService.client().search(
      env().QDRANT_COLLECTION,
      {
        vector,
        limit,
        with_payload: true,
        filter: {
          must: [{ key: 'bot-id', match: { value: env().QDRANT_BOT_NAME } }],
        },
      },
    );

    return results.map((point) => (point.payload as MemoryEmbedding)?.text);
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
