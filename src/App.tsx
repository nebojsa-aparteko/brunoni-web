import React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router';
import Routes from './pages/Routes';
import Dashboard from './pages/Dashboard';
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
    <Route exact path="/dashboard" component={requireUser(Dashboard)} />
    <Route component={NotFound} />
  </Switch>
);

export default App;
