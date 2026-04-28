import { getLogger } from '@logtape/logtape';
import { ai } from '../../../services/ai';
import type { StateHandler } from '../types';

const logger = getLogger(['OpenBorys', 'Agent', 'Discord', 'EventHandlers', 'Thinking']);


export const thinking: StateHandler = async (ctx) => {
  await ai.generateText({ messages: ctx.messages });

  return null;
};
