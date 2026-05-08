import { Route, Switch } from 'wouter';

export function App() {
  return (
    <Switch>
      <Route path="/">Root</Route>

      <Route>404</Route>
    </Switch>
  );
}
