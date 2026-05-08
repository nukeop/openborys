import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch } from 'wouter';
import { Home } from './pages/Home';

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/">
          <Home />
        </Route>

        <Route>
          <div className="p-8 text-zinc-500">404</div>
        </Route>
      </Switch>
    </QueryClientProvider>
  );
}
