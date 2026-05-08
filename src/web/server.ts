import { getLogger } from '@logtape/logtape';
import { getIntrospection } from './api/introspect';
import { getSkill, getSkills, loadSkill, unloadSkill } from './api/skills';
import index from './index.html';

const logger = getLogger(['OpenBorys', 'web']);

const ADMIN_PORT = 3000;

export function startAdminServer() {
  const server = Bun.serve({
    port: ADMIN_PORT,
    routes: {
      '/api/introspect': {
        GET() {
          return Response.json(getIntrospection());
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
            const message =
              error instanceof Error ? error.message : String(error);
            return Response.json({ error: message }, { status: 400 });
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
