import React, { Fragment, useContext, useEffect } from 'react';
import { Route, Switch } from 'react-router';
import { Backdrop, CircularProgress, makeStyles, Theme } from '@material-ui/core';

import Routes from './pages/Routes';
import Dashboard from './pages/Dashboard';
import EquipmentSituation from './pages/EquipmentSituation';
import QuotePageContainer from './pages/QuotePageContainer';
import GetQuotes from './pages/GetQuotes';
import QuoteGroups from './pages/QuoteGroupsPage';
import QuoteGroup from './pages/QuoteGroupPage';
import BookingsPageContainer from './pages/BookingsPage';
import BookingContainer from './pages/BookingContainer';
import SideCharges from './pages/SideCharges';
import AdminDashboard from './pages/AdminDashboard';
import AdminQuoteGroup from './pages/AdminQuoteGroup';
import AdminSideCharges from './pages/AdminSideCharges';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import useUser from './hooks/useUser';
import Navbar from './components/Navbar';
import AllmarineFooter from './components/AllmarineFooter';
import BrunoniFooter from './components/BrunoniFooter';
import ScrollToTop from './components/ScrollToTop';
import ActingAs from './contexts/ActingAs';
import UserRecord from './contexts/UserRecordContext';
import ChartsCircularProgress from './components/dashboard/ChartsCircularProgress';
import TeamManagementPage from './pages/TeamManagementPage';
import { isDashboardUser } from './model/UserRecord';
import VesselWithVoyagePage from './pages/VesselWithVoyagePage';
import LoadListPage from './pages/LoadListPage';
import AdminRedirect from './pages/AdminRedirect';
import BookingListFilterProvider from './providers/BookingListFilterProvider';
import { QuoteFilterListProvider } from './providers/QuoteListFilterContext';
import BookingListPaginationProvider from './providers/BookingListPaginationProvider';
import MyDayPage from './pages/MyDayPage';
import * as QueryString from 'querystring';
import { useHistory } from 'react-router-dom';
import MyProfilePage from './pages/MyProfilePage';
import WeeklyPaymentPage from './pages/WeeklyPaymentPage';
import firebase from './firebase';
import CommissionsPage from './pages/CommissionsPage';
import { GlobalContext } from './store/GlobalStore';
import TaskFilterProvider from './providers/TaskFilterProvider';
import { setLastOpenedChecklistTab } from './components/bookings/checklist/CheckList';
import { notificationSeenStatusChange } from './components/notifications/NotificationItemView';

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
    <Route exact path="/" component={AdminRedirect} />
    <Route exact path="/client-statistics" component={AdminDashboard} />
    <Route exact path="/schedule" component={Routes} />
    <Route exact path="/quotes/groups" component={QuoteGroups} />
    <Route exact path="/quotes/groups/:id" component={AdminQuoteGroup} />
    <Route exact path="/quotes/:id" component={QuotePageContainer} />
    <Route exact path="/bookings" component={BookingsPageContainer} />
    <Route exact path="/bookings/:id" component={BookingContainer} />
    <Route exact path="/teams" component={TeamManagementPage} />
    <Route path="/charges" component={AdminSideCharges} />
    <Route exact path="/vessel" component={VesselWithVoyagePage} />
    <Route exact path="/loadList" component={LoadListPage} />
    <Route exact path="/my-day" component={MyDayPage} />
    <Route exact path="/my-profile" component={MyProfilePage} />
    <Route exact path="/equipment" component={EquipmentSituation} />
    <Route exact path="/weekly-payment" component={WeeklyPaymentPage} />
    <Route exact path="/commissions" component={CommissionsPage} />
    <Route path="/not-found" component={NotFound} />
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
    <Route exact path="/quotes/:id" component={QuotePageContainer} />
    <Route exact path="/bookings" component={BookingsPageContainer} />
    <Route exact path="/bookings/:id" component={BookingContainer} />
    <Route exact path="/equipment" component={EquipmentSituation} />
    <Route exact path="/my-day" component={MyDayPage} />
    <Route exact path="/my-profile" component={MyProfilePage} />
    <Route path="/charges" component={SideCharges} />
    <Route path="/not-found" component={NotFound} />
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
          return isDashboardUser(userRecord) ? adminRoutes : <Unauthorized />;
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
  backdrop: {
    zIndex: 10000,
    color: '#fff',
  },
}));

const App: React.FC = () => {
  const classes = useStyles();
  const [user, userRecord] = useUser();
  const history = useHistory();
  const [state] = useContext(GlobalContext);
  const { isGlobalLoadingInProgress } = state;

  // If we come from email notification, we want to read that notification and delete it from url
  useEffect(() => {
    const params = QueryString.parse(window.location.search.replace('?', ''));

    if (params.readNotification) {
      const notificationId = params.readNotification as string;

      if (params.checklistTab) {
        setLastOpenedChecklistTab(`${params.checklistTab as string}`, user.uid)
          .then(() => delete params.checklistTab)
          .then(() => {
            //read that notification
            notificationSeenStatusChange(notificationId, userRecord, true).then(() => {
              delete params.readNotification;
              history.replace(`${window.location.pathname}?${QueryString.stringify(params)}`);
            });
          });
      } else {
        //read that notification
        notificationSeenStatusChange(notificationId, userRecord, true).then(() => {
          delete params.readNotification;
          history.replace(`${window.location.pathname}?${QueryString.stringify(params)}`);
        });
      }
    }
  }, [history]);
  return (
    <Fragment>
      <QuoteFilterListProvider>
        <TaskFilterProvider>
          <BookingListPaginationProvider>
            <BookingListFilterProvider>
              <Navbar />
              <Backdrop className={classes.backdrop} open={isGlobalLoadingInProgress}>
                <CircularProgress color="inherit" />
              </Backdrop>
              <div className={classes.deviceControl}>
                {user === undefined ? <ChartsCircularProgress /> : user === null ? anonymousRoutes : <UserRoutes />}
              </div>
              <ScrollToTop className={classes.goTop} />
              {process.env.REACT_APP_BRAND === 'brunoni' ? (
                <BrunoniFooter />
              ) : process.env.REACT_APP_BRAND === 'allmarine' ? (
                <AllmarineFooter />
              ) : null}
            </BookingListFilterProvider>
          </BookingListPaginationProvider>
        </TaskFilterProvider>
      </QuoteFilterListProvider>
    </Fragment>
  );
};

export default App;
