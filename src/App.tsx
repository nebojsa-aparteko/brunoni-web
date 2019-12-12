import React, { Fragment, useContext } from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router';
import { makeStyles, Theme } from '@material-ui/core';

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
import SideCharges from './pages/SideCharges';
import ActingAs from './contexts/ActingAs';
import UserRecord from './contexts/UserRecord';
import Admin from './components/admin/Admin';
import ChartsCircularProgress from './components/dashboard/ChartsCircularProgress';

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
      return <ChartsCircularProgress />;
    case null:
      return <ComponentB {...props} />;
    default:
      return <ComponentA {...props} />;
  }
};

const requireUser = <P extends RouteComponentProps<any> | any>(Component: React.ComponentType<P>) => (props: P) => {
  const [actingAs] = useContext(ActingAs);

  switch (actingAs) {
    case undefined:
      return <ChartsCircularProgress />;
    case null:
      return <Unauthorized />;
    default:
      return <Component {...props} />;
  }
};

const requireAdmin = <P extends RouteComponentProps<any> | any>(Component: React.ComponentType<P>) => (props: P) => {
  const userRecord = useContext(UserRecord);
  const [actingAs] = useContext(ActingAs);

  switch (actingAs) {
    case undefined:
      return <ChartsCircularProgress />;
    case null:
      switch (userRecord) {
        case undefined:
          return <ChartsCircularProgress />;
        case null:
          return <Unauthorized />;
        default:
          return userRecord.isAdmin ? <Component {...props} /> : <Unauthorized />;
      }
    default:
      return <Unauthorized />;
  }
};

const routes = (
  <Switch>
    <Route exact path="/" component={switchUser(requireUser(Dashboard), Routes)} />
    <Route exact path="/schedule" component={requireUser(Routes)} />
    <Route exact path="/quotes/groups" component={requireUser(QuoteGroups)} />
    <Route exact path="/quotes/groups/:id" component={requireUser(QuoteGroup)} />
    <Route exact path="/quotes/get" component={requireUser(GetQuotes)} />
    <Route exact path="/quotes/:id" component={requireUser(Quote)} />
    <Route exact path="/equipment" component={requireUser(EquipmentSituation)} />
    <Route exact path="/charges" component={requireUser(SideCharges)} />
    <Route exact path="/admin" component={requireAdmin(Admin)} />
    <Route component={NotFound} />
  </Switch>
);

const App: React.FC = () => {
  const classes = useStyles();
  const actingAs = useContext(ActingAs);

  return (
    <Fragment>
      <Navbar />
      <div className={classes.deviceControl}>{routes}</div>
      <ScrollToTop scrollStepInPx={50} delayInMs={30} className={classes.goTop} />
      <Footer />
    </Fragment>
  );
};

export default App;
