import { getLogger } from '@logtape/logtape';
import z from 'zod';
import { env, isProd } from '../environment';
import { CredentialsService } from './credentials';
import {
  clearSessionCookie,
  createSessionCookie,
  readSession,
} from './session';
import index from './web/index.html';

const logger = getLogger(['OpenBorys', 'admin', 'server']);

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

const requireSession = async (request: Request) => {
  const session = await readSession(request);
  if (!session) {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }
  return session;
};

export const startAdminServer = async () => {
  await CredentialsService.load();

  const server = Bun.serve({
    port: env().ADMIN_PORT,
    development: !isProd(),
    routes: {
      '/': index,

      '/api/me': async (request) => {
        const session = await requireSession(request);
        if (session instanceof Response) {
          return session;
        }
        return Response.json({ username: session.username });
      },

      '/api/login': {
        POST: async (request) => {
          const body = loginSchema.safeParse(await request.json());
          if (!body.success) {
            return Response.json({ error: 'invalid request' }, { status: 400 });
          }
          const ok = await CredentialsService.verify(
            body.data.username,
            body.data.password,
          );
          if (!ok) {
            return Response.json(
              { error: 'invalid credentials' },
              { status: 401 },
            );
          }
          const cookie = await createSessionCookie(body.data.username);
          return new Response(
            JSON.stringify({ username: body.data.username }),
            {
              status: 200,
              headers: {
                'content-type': 'application/json',
                'set-cookie': cookie,
              },
            },
          );
        },
      },

      '/api/logout': {
        POST: () =>
          new Response(null, {
            status: 204,
            headers: { 'set-cookie': clearSessionCookie() },
          }),
      },

      '/api/status': async (request) => {
        const session = await requireSession(request);
        if (session instanceof Response) {
          return session;
        }
        return Response.json({
          uptimeSeconds: Math.round(process.uptime()),
          memoryMb: Math.round(process.memoryUsage.rss() / (1024 * 1024)),
          nodeEnv: env().NODE_ENV,
          botName: env().BOT_NAME,
          adminUserCount: CredentialsService.count(),
        });
      },
    },
  });

  logger.info('Admin server listening on port {port}', { port: server.port });
};
