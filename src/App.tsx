import React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router';
import Routes from './pages/Routes';
import Dashboard from './pages/Dashboard';
import GetQuotes from './pages/GetQuotes';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

import useUser from './hooks/useUser';

const requireUser = <P extends RouteComponentProps<any> | any>(Component: React.ComponentType<P>) => (props: P) => {
  const user = useUser();

  switch (user) {
    case undefined:
      return null;
    case null:
      return <Unauthorized />;
    default:
      return <Component {...props} />;
  }
};

const App: React.FC = () => (
  <Switch>
    <Route exact path="/" component={Routes} />
    {process.env.NODE_ENV !== 'production' ? (
      <Route exact path="/dashboard" component={Dashboard} />
    ) : (
      <Route exact path="/dashboard" component={requireUser(Dashboard)} />
    )}
    <Route exact path="/quotes/get" component={requireUser(GetQuotes)} />
    <Route component={NotFound} />
  </Switch>
);

export default App;
