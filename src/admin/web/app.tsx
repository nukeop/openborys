import { StrictMode, useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Link, Redirect, Route, Switch, useLocation } from 'wouter';

type Me = { username: string };

const api = async <T,>(
  path: string,
  init?: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false; status: number }> => {
  const response = await fetch(path, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
    credentials: 'same-origin',
  });
  if (!response.ok) {
    return { ok: false, status: response.status };
  }
  const data = response.status === 204 ? null : await response.json();
  return { ok: true, data: data as T };
};

const useMe = () => {
  const [me, setMe] = useState<Me | null | undefined>(undefined);

  const refresh = useCallback(async () => {
    const result = await api<Me>('/api/me');
    setMe(result.ok ? result.data : null);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { me, setMe, refresh };
};

const LoginPage = ({ onLogin }: { onLogin: (me: Me) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await api<Me>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.status === 401 ? 'Invalid credentials' : 'Login failed');
      return;
    }
    onLogin(result.data);
  };

  return (
    <div className="layout">
      <form className="login card" onSubmit={submit}>
        <h2>Sign in</h2>
        <label>
          Username
          <input
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
};

type Status = {
  uptimeSeconds: number;
  memoryMb: number;
  nodeEnv: string;
  botName: string;
  adminUserCount: number;
};

const formatUptime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
};

const DashboardPage = () => {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    const tick = async () => {
      const result = await api<Status>('/api/status');
      if (result.ok) {
        setStatus(result.data);
      }
    };
    tick();
    const interval = setInterval(tick, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card">
      <h2>Status</h2>
      {status ? (
        <dl>
          <dt>Bot</dt>
          <dd>{status.botName}</dd>
          <dt>Environment</dt>
          <dd>{status.nodeEnv}</dd>
          <dt>Uptime</dt>
          <dd>{formatUptime(status.uptimeSeconds)}</dd>
          <dt>Memory (RSS)</dt>
          <dd>{status.memoryMb} MB</dd>
          <dt>Admin users</dt>
          <dd>{status.adminUserCount}</dd>
        </dl>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

const SettingsPage = () => (
  <div className="card">
    <h2>Settings</h2>
    <p>Nothing to configure here yet.</p>
  </div>
);

const Shell = ({ me, onLogout }: { me: Me; onLogout: () => void }) => {
  const [, setLocation] = useLocation();
  const logout = async () => {
    await api('/api/logout', { method: 'POST' });
    onLogout();
    setLocation('/');
  };
  return (
    <div className="layout">
      <nav className="nav">
        <Link href="/">Dashboard</Link>
        <Link href="/settings">Settings</Link>
        <span className="spacer" />
        <span>{me.username}</span>
        <button className="ghost" onClick={logout} type="button">
          Sign out
        </button>
      </nav>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route>
          <Redirect to="/" />
        </Route>
      </Switch>
    </div>
  );
};

const App = () => {
  const { me, setMe, refresh } = useMe();

  if (me === undefined) {
    return null;
  }
  if (me === null) {
    return (
      <LoginPage
        onLogin={(next) => {
          setMe(next);
          refresh();
        }}
      />
    );
  }
  return <Shell me={me} onLogout={() => setMe(null)} />;
};

const root = document.getElementById('root');
if (!root) {
  throw new Error('Missing #root element');
}
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
