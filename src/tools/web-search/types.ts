import type { z } from 'zod';
import type { webSearchInputSchema } from './schema';
import type { TavilySearchResponse } from '@tavily/core';

export type WebSearchInput = z.infer<typeof webSearchInputSchema>;

type TavilySearchResult = TavilySearchResponse['results'][number];
export type SearchResult = Pick<TavilySearchResult, 'title' | 'url' | 'content' | 'score'>;

export type WebSearchResponse = {
  answer: string | null;
  results: SearchResult[];
};
