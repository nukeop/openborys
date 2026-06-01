import type { ReplyDecision } from '../../clients/discord/reply-decision/store';

export const replyDecisionsQuery = {
  queryKey: ['reply-decisions'] as const,
  queryFn: async (): Promise<ReplyDecision[]> =>
    (await (await fetch('/api/reply-decisions')).json()) as ReplyDecision[],
};
