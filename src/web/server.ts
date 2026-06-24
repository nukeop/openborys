import { getLogger } from '@logtape/logtape';
import { ReplyDecisionStore } from '../clients/discord/reply-decision/store';
import { PhoneMessageCache } from '../tools/phone/message-cache';
import { errorMessage } from '../utils/error';
import { getIntrospection } from './api/introspect';
import { getSkill, getSkills, loadSkill, unloadSkill } from './api/skills';
import { getTools } from './api/tools';
import { guard } from './auth';
import index from './index.html';

const logger = getLogger(['OpenBorys', 'web']);

const ADMIN_PORT = 3000;

const RECENT_DECISION_LIMIT = 10;
const RECENT_CALLS_LIMIT = 20;

export function startAdminServer() {
  const server = Bun.serve({
    port: ADMIN_PORT,
    routes: {
      '/api/introspect': {
        GET: guard(() => Response.json(getIntrospection())),
      },
      '/api/tools': {
        GET: guard(() => Response.json(getTools())),
      },
      '/api/reply-decisions': {
        GET: guard(() =>
          Response.json(ReplyDecisionStore.getRecent(RECENT_DECISION_LIMIT)),
        ),
      },
      '/api/phone-calls': {
        GET: guard(() =>
          Response.json(
            PhoneMessageCache.getInstance().getRecentCalls(RECENT_CALLS_LIMIT),
          ),
        ),
      },
      '/api/skills': {
        GET: guard(() => Response.json(getSkills())),
        POST: guard(async (req) => {
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
        }),
      },
      '/api/skills/:name': guard((req) => {
        const name = decodeURIComponent(req.params.name);

        if (req.method === 'DELETE') {
          unloadSkill(name);
          return new Response(null, { status: 204 });
        }

        return Response.json(getSkill(name));
      }),
      '/*': index,
    },
  });

  logger.info('Admin server running on {url}', { url: server.url });
}
