import { tool } from 'ai';
import { tavily } from '@tavily/core';
import { getLogger } from '@logtape/logtape';
import { env } from '../../environment';
import type { ToolWithMeta } from '../../services/tools';
import { webSearchInputSchema } from './schema';
import type { WebSearchInput, SearchResult, WebSearchResponse } from './types';

const logger = getLogger(['OpenBorys', 'tools', 'web-search']);

export const webSearchTool: ToolWithMeta<WebSearchInput, string> = {
  id: 'web_search',
  name: 'Web Search',
  isAlwaysAvailable: true,
  tool: tool({
    description: 'Search the web.',
    inputSchema: webSearchInputSchema,
    execute: async ({ query, topic, max_results, include_answer }) => {
      logger.info('Searching the web: {query}', { query });

      try {
        const client = tavily({ apiKey: env().TAVILY_API_KEY });

        const response = await client.search(query, {
          topic,
          maxResults: max_results,
          includeAnswer: include_answer,
          includeImages: false,
          includeRawContent: false,
        });

        const results: SearchResult[] = response.results.map((result) => ({
          title: result.title,
          url: result.url,
          content: result.content,
          score: result.score,
        }));

        const payload: WebSearchResponse = {
          answer: response.answer ?? null,
          results,
        };

        return JSON.stringify(payload);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return `Web search failed: ${message}`;
      }
    },
  }),
};
