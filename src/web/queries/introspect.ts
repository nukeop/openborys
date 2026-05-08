import type { Introspection } from '../api/introspect';

export const introspectQuery = {
  queryKey: ['introspect'] as const,
  queryFn: async (): Promise<Introspection> =>
    (await fetch('/api/introspect')).json(),
};
