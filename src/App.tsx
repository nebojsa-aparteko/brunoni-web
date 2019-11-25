import React from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router';
import Routes from './pages/Routes';
import Dashboard from './pages/Dashboard';
import GetQuotes from './pages/GetQuotes';
import Quotes from './pages/Quotes';
import Quote from './pages/Quote';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

import useUser from './hooks/useUser';

const switchUser = <P extends RouteComponentProps<any> | any>(
  ComponentA: React.ComponentType<P>,
  ComponentB: React.ComponentType<P>,
) => (props: P) => {
  const user = useUser();

  switch (user) {
    case undefined:
      return null;
    case null:
      return <ComponentB {...props} />;
    default:
      return <ComponentA {...props} />;
  }
};

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
    <Route exact path="/" component={switchUser(Dashboard, Routes)} />
    <Route exact path="/schedule" component={requireUser(Routes)} />
    <Route exact path="/quotes" component={Quotes} />
    <Route exact path="/quotes/get" component={requireUser(GetQuotes)} />
    <Route exact path="/quotes/:id" component={Quote} />
    {/** TODO Remove temporary route /dashboard */}
    <Route exact path="/dashboard" component={Dashboard} />
    <Route component={NotFound} />
  </Switch>
);

export default App;
