import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch } from 'wouter';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { PhoneChat } from './pages/PhoneChat';
import { Skill } from './pages/Skill';

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Navbar />
      <Switch>
        <Route path="/">
          <Home />
        </Route>
        <Route path="/skills/:name" component={Skill} />
        <Route path="/phone/:contact" component={PhoneChat} />

        <Route>
          <div className="p-8 text-zinc-500">404</div>
        </Route>
      </Switch>
    </QueryClientProvider>
  );
}
