import { getLogger } from '@logtape/logtape';
import { ReplyDecisionStore } from '../clients/discord/reply-decision/store';
import { errorMessage } from '../utils/error';
import { getIntrospection } from './api/introspect';
import { getSkill, getSkills, loadSkill, unloadSkill } from './api/skills';
import { getTools } from './api/tools';
import index from './index.html';

const logger = getLogger(['OpenBorys', 'web']);

const ADMIN_PORT = 3000;

const RECENT_DECISION_LIMIT = 10;

export function startAdminServer() {
  const server = Bun.serve({
    port: ADMIN_PORT,
    routes: {
      '/api/introspect': {
        GET() {
          return Response.json(getIntrospection());
        },
      },
      '/api/tools': {
        GET() {
          return Response.json(getTools());
        },
      },
      '/api/reply-decisions': {
        GET() {
          return Response.json(
            ReplyDecisionStore.getRecent(RECENT_DECISION_LIMIT),
          );
        },
      },
      '/api/skills': {
        GET() {
          return Response.json(getSkills());
        },
        async POST(req) {
          const { url } = (await req.json()) as { url: string };
          try {
            const skill = await loadSkill(url);
            return Response.json(skill, { status: 201 });
          } catch (error) {
            return Response.json(
              { error: errorMessage(error) },
              { status: 400 },
            );
          }
        },
      },
      '/api/skills/:name': (req) => {
        const name = decodeURIComponent(req.params.name);

        if (req.method === 'DELETE') {
          unloadSkill(name);
          return new Response(null, { status: 204 });
        }

        return Response.json(getSkill(name));
      },
      '/*': index,
    },
  });

  logger.info('Admin server running on {url}', { url: server.url });
}
