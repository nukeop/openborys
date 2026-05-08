import { getLogger } from '@logtape/logtape';
import index from './index.html';

const logger = getLogger(['OpenBorys', 'web']);

const ADMIN_PORT = 3000;

export function startAdminServer() {
  const server = Bun.serve({
    port: ADMIN_PORT,
    routes: {
      '/*': index,
    },
  });

  logger.info('Admin server running on {url}', { url: server.url });
}
