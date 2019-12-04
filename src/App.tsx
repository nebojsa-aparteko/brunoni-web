import React, { Fragment } from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router';
import Routes from './pages/Routes';
import Dashboard from './pages/Dashboard';
import EquipmentSituation from './pages/EquipmentSituation';
import Quote from './pages/Quote';
import GetQuotes from './pages/GetQuotes';
import QuoteGroups from './pages/QuoteGroups';
import QuoteGroup from './pages/QuoteGroup';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

import useUser from './hooks/useUser';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  goTop: {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
  },
  deviceControl: {
    [theme.breakpoints.down('sm')]: {
      paddingTop: theme.spacing(7),
    },
  },
}));

const switchUser = <P extends RouteComponentProps<any> | any>(
  ComponentA: React.ComponentType<P>,
  ComponentB: React.ComponentType<P>,
) => (props: P) => {
  const [user] = useUser();

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
  const [user] = useUser();

  switch (user) {
    case undefined:
      return null;
    case null:
      return <Unauthorized />;
    default:
      return <Component {...props} />;
  }
};

const App: React.FC = () => {
  const classes = useStyles();
  return (
    <Fragment>
      <Navbar />
      <div className={classes.deviceControl}>
        <Switch>
          <Route exact path="/" component={switchUser(Dashboard, Routes)} />
          <Route exact path="/schedule" component={requireUser(Routes)} />
          <Route exact path="/quotes/groups" component={requireUser(QuoteGroups)} />
          <Route exact path="/quotes/groups/:id" component={requireUser(QuoteGroup)} />
          <Route exact path="/quotes/get" component={requireUser(GetQuotes)} />
          <Route exact path="/quotes/:id" component={requireUser(Quote)} />
          <Route exact path="/equipment" component={requireUser(EquipmentSituation)} />
          {/** TODO Remove temporary route /dashboard */}
          <Route exact path="/dashboard" component={Dashboard} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <ScrollToTop scrollStepInPx={50} delayInMs={30} className={classes.goTop} />
      <Footer />
    </Fragment>
  );
};

export default App;
