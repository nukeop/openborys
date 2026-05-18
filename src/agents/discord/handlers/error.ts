import { getLogger } from '@logtape/logtape';
import { ScopedToolService } from '../../../services/scoped-tools';
import type { StateHandler } from '../types';

const logger = getLogger([
  'OpenBorys',
  'Agent',
  'Discord',
  'EventHandlers',
  'Error',
]);

export const error: StateHandler = async (ctx) => {
  logger.error('Agent run terminated due to error');
  ScopedToolService.clearScope(ctx.source.id);
  return null;
};
