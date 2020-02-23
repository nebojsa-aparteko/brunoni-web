import React, { Fragment, useContext } from 'react';
import { Route, Switch } from 'react-router';
import { Button, makeStyles, Theme } from '@material-ui/core';

import Routes from './pages/Routes';
import Dashboard from './pages/Dashboard';
import EquipmentSituation from './pages/EquipmentSituation';
import Quote from './pages/Quote';
import GetQuotes from './pages/GetQuotes';
import QuoteGroups from './pages/QuoteGroups';
import QuoteGroup from './pages/QuoteGroup';
import Bookings from './pages/Bookings';
import SideCharges from './pages/SideCharges';
import AdminDashboard from './pages/AdminDashboard';
import AdminQuoteGroups from './pages/AdminQuoteGroups';
import AdminQuoteGroup from './pages/AdminQuoteGroup';
import AdminQuote from './pages/AdminQuote';
import AdminSideCharges from './pages/AdminSideCharges';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import useUser from './hooks/useUser';
import Navbar from './components/Navbar';
import AllmarineFooter from './components/AllmarineFooter';
import BrunoniFooter from './components/BrunoniFooter';
import ScrollToTop from './components/ScrollToTop';
import ActingAs from './contexts/ActingAs';
import UserRecord from './contexts/UserRecord';
import ChartsCircularProgress from './components/dashboard/ChartsCircularProgress';

const anonymousRoutes = (
  <Switch>
    <Route exact path="/" component={Routes} />
    <Route exact path="/schedule" component={Unauthorized} />
    <Route exact path="/quotes/groups" component={Unauthorized} />
    <Route exact path="/quotes/groups/:id" component={Unauthorized} />
    <Route exact path="/quotes/get" component={Unauthorized} />
    <Route exact path="/quotes/:id" component={Unauthorized} />
    <Route exact path="/equipment" component={Unauthorized} />
    <Route path="/charges" component={Unauthorized} />
    <Route component={NotFound} />
  </Switch>
);

const adminRoutes = (
  <Switch>
    <Route exact path="/" component={AdminDashboard} />
    <Route exact path="/schedule" component={Unauthorized} />
    <Route exact path="/quotes/groups" component={AdminQuoteGroups} />
    <Route exact path="/quotes/groups/:id" component={AdminQuoteGroup} />
    <Route exact path="/quotes/:id" component={AdminQuote} />
    <Route exact path="/bookings" component={Bookings} />
    <Route exact path="/equipment" component={Unauthorized} />
    <Route path="/charges" component={AdminSideCharges} />
    <Route component={NotFound} />
  </Switch>
);

const userRoutes = (
  <Switch>
    <Route exact path="/" component={Dashboard} />
    <Route exact path="/schedule" component={Routes} />
    <Route exact path="/quotes/groups" component={QuoteGroups} />
    <Route exact path="/quotes/groups/:id" component={QuoteGroup} />
    <Route exact path="/quotes/get" component={GetQuotes} />
    <Route exact path="/quotes/:id" component={Quote} />
    <Route exact path="/bookings" component={Bookings} />
    <Route exact path="/equipment" component={EquipmentSituation} />
    <Route path="/charges" component={SideCharges} />
    <Route component={NotFound} />
  </Switch>
);

const UserRoutes: React.FC = () => {
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
          return userRoutes;
        default:
          return userRecord.isAdmin ? adminRoutes : <Unauthorized />;
      }
    default:
      return userRoutes;
  }
};

const useStyles = makeStyles((theme: Theme) => ({
  goTop: {
    position: 'fixed',
    bottom: '100px',
    right: '22px',
  },
  deviceControl: {
    [theme.breakpoints.down('sm')]: {
      paddingTop: theme.spacing(7),
    },
  },
}));

const App: React.FC = () => {
  const classes = useStyles();
  const [user] = useUser();

  return (
    <Fragment>
      <Navbar />
      <div className={classes.deviceControl}>
        {user === undefined ? <ChartsCircularProgress /> : user === null ? anonymousRoutes : <UserRoutes />}
      </div>
      <ScrollToTop scrollStepInPx={50} delayInMs={30} className={classes.goTop} />
      {process.env.REACT_APP_BRAND === 'brunoni' ? (
        <BrunoniFooter />
      ) : process.env.REACT_APP_BRAND === 'allmarine' ? (
        <AllmarineFooter />
      ) : null}
    </Fragment>
  );
};

export default App;
