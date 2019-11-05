import React from 'react';
import { Route, Switch } from 'react-router';
import Routes from './pages/Routes';
import NotFound from './pages/NotFound';

const App: React.FC = () => (
  <Switch>
    <Route exact path="/" component={Routes} />
    <Route component={NotFound} />
  </Switch>
);

export default App;
