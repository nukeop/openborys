import { env } from '../environment';

const COOKIE_NAME = 'openborys_admin';

type SessionPayload = {
  username: string;
  expiresAt: number;
};

const toBase64Url = (bytes: Uint8Array): string => {
  return Buffer.from(bytes).toString('base64url');
};

const fromBase64Url = (value: string): Uint8Array<ArrayBuffer> => {
  return Uint8Array.from(Buffer.from(value, 'base64url'));
};

const sign = async (payload: string): Promise<string> => {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env().ADMIN_SESSION_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payload),
  );
  return toBase64Url(new Uint8Array(signature));
};

const verify = async (payload: string, signature: string): Promise<boolean> => {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env().ADMIN_SESSION_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
  return crypto.subtle.verify(
    'HMAC',
    key,
    fromBase64Url(signature),
    new TextEncoder().encode(payload),
  );
};

export const createSessionCookie = async (
  username: string,
): Promise<string> => {
  const expiresAt = Date.now() + env().ADMIN_SESSION_TTL_HOURS * 60 * 60 * 1000;
  const payload: SessionPayload = { username, expiresAt };
  const encodedPayload = toBase64Url(
    new TextEncoder().encode(JSON.stringify(payload)),
  );
  const signature = await sign(encodedPayload);
  const value = `${encodedPayload}.${signature}`;
  const maxAge = Math.floor((expiresAt - Date.now()) / 1000);
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}`;
};

export const clearSessionCookie = (): string => {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
};

const parseCookie = (header: string | null): string | null => {
  if (!header) {
    return null;
  }
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === COOKIE_NAME) {
      return rest.join('=');
    }
  }
  return null;
};

export const readSession = async (
  request: Request,
): Promise<SessionPayload | null> => {
  const raw = parseCookie(request.headers.get('cookie'));
  if (!raw) {
    return null;
  }
  const [encodedPayload, signature] = raw.split('.');
  if (!encodedPayload || !signature) {
    return null;
  }
  if (!(await verify(encodedPayload, signature))) {
    return null;
  }
  try {
    const payload: SessionPayload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(encodedPayload)),
    );
    if (payload.expiresAt < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};
