import { tool } from 'ai';
import { tavily } from '@tavily/core';
import { getLogger } from '@logtape/logtape';
import { env } from '../../environment';
import type { ToolWithMeta } from '../../services/tools';
import { webFetchInputSchema } from './schema';
import type { WebFetchInput } from './types';

const logger = getLogger(['OpenBorys', 'tools', 'web-fetch']);

export const webFetchTool: ToolWithMeta<WebFetchInput, string> = {
  id: 'web_fetch',
  name: 'Web Fetch',
  emoji: '🌐',
  isAlwaysAvailable: true,
  formatArgs: (args) => args.url,
  tool: tool({
    description: 'Extract the contents of a web page.',
    inputSchema: webFetchInputSchema,
    execute: async ({ url, format }) => {
      logger.info('Fetching URL: {url}', { url });

      try {
        const client = tavily({ apiKey: env().TAVILY_API_KEY });

        const response = await client.extract([url], {
          format,
          includeImages: false,
        });

        const failed = response.failedResults.find((r) => r.url === url);
        if (failed) {
          return `Failed to extract content from ${url}: ${failed.error}`;
        }

        const result = response.results[0];
        if (!result) {
          return `No content returned for ${url}`;
        }

        return result.rawContent;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return `Web fetch failed: ${message}`;
      }
    },
  }),
};
