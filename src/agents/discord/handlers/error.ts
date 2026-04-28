import { getLogger } from '@logtape/logtape';
import type { StateHandler } from '../types';

const logger = getLogger([
  'OpenBorys',
  'Agent',
  'Discord',
  'EventHandlers',
  'Error',
]);

export const error: StateHandler = async (_ctx) => {
  logger.error('Agent run terminated due to error');
  return null;
};
