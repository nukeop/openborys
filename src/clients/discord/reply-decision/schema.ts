import { jsonSchema } from 'ai';

export type ReplyDecisionResult = {
  reason: string;
  shouldReply: boolean;
};

export const replyDecisionSchema = jsonSchema<ReplyDecisionResult>({
  type: 'object',
  properties: {
    reason: { type: 'string' },
    shouldReply: { type: 'boolean' },
  },
  required: ['reason', 'shouldReply'],
  additionalProperties: false,
});
