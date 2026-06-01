import { createHash, timingSafeEqual } from 'node:crypto';
import type { BunRequest } from 'bun';
import { env } from '../environment';

const REALM = 'OpenBorys';

const unauthorized = (): Response =>
  new Response('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': `Basic realm="${REALM}"` },
  });

const sha256 = (value: string): Buffer =>
  createHash('sha256').update(value).digest();

const passwordMatches = (provided: string): boolean =>
  timingSafeEqual(sha256(provided), sha256(env().DASHBOARD_PWD));

const extractPassword = (header: string | null): string | null => {
  if (!header?.startsWith('Basic ')) {
    return null;
  }

  const decoded = Buffer.from(header.slice('Basic '.length), 'base64').toString(
    'utf8',
  );
  const separator = decoded.indexOf(':');
  if (separator === -1) {
    return null;
  }

  return decoded.slice(separator + 1);
};

const isAuthorized = (request: Request): boolean => {
  const password = extractPassword(request.headers.get('Authorization'));
  return password !== null && passwordMatches(password);
};

type RouteHandler<PathT extends string> = (
  request: BunRequest<PathT>,
) => Response | Promise<Response>;

export const guard =
  <PathT extends string>(handler: RouteHandler<PathT>): RouteHandler<PathT> =>
  (request) => {
    if (!isAuthorized(request)) {
      return unauthorized();
    }
    return handler(request);
  };
