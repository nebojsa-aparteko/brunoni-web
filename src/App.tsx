import React, { Fragment, useContext, useEffect } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { Backdrop, CircularProgress, makeStyles, Theme } from '@material-ui/core';
import queryString from 'query-string';

import RoutesPage from './pages/Routes';
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
import MyProfilePage from './pages/MyProfilePage';
import WeeklyPaymentPage from './pages/WeeklyPaymentPage';
import CommissionsPage from './pages/CommissionsPage';
import { GlobalContext } from './store/GlobalStore';
import TaskFilterProvider from './providers/TaskFilterProvider';
import { setLastOpenedChecklistTab } from './components/bookings/checklist/CheckList';
import {
  notificationSeenStatusChange,
  NotificationStatusAction,
} from './components/notifications/NotificationItemView';
import EquipmentControlPage from './pages/EquipmentControlPage';
import OnlineBookingPage from './pages/OnlineBookingPage';
import BookingRequestContainer from './components/bookingRequests/BookingRequestContainer';
import BookingRequestsFilterProvider from './providers/BookingRequestsFilterProvider';
import useAntiTrust from './hooks/useAntiTrust';
import LandTransportPage from './pages/LandTransportPage';
import LandTransportConfigPage from './pages/LandTransportConfigPage';
import LandTransportConfigProviderPage from './pages/LandTransportConfigProviderPage';
import OpportunitiesConfigPage from './pages/OpportunitiesConfigPage';
const anonymousRoutes = (
  <Routes>
    <Route path="/" element={<RoutesPage />} />
    <Route path="/schedule" element={<Unauthorized />} />
    <Route path="/quotes/groups" element={<Unauthorized />} />
    <Route path="/quotes/groups/:id" element={<Unauthorized />} />
    <Route path="/quotes/get" element={<Unauthorized />} />
    <Route path="/quotes/:id" element={<Unauthorized />} />
    <Route path="/equipment" element={<Unauthorized />} />
    <Route path="/charges/*" element={<Unauthorized />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const adminRoutes = (
  <Routes>
    <Route path="/" element={<AdminRedirect />} />
    <Route path="/client-statistics" element={<AdminDashboard />} />
    <Route path="/schedule" element={<RoutesPage />} />
    <Route path="/quotes/groups" element={<QuoteGroups />} />
    <Route path="/quotes/groups/:id" element={<AdminQuoteGroup />} />
    <Route path="/quotes/:id" element={<QuotePageContainer />} />
    <Route path="/online-booking" element={<OnlineBookingPage />} />
    <Route path="/booking-requests/:id" element={<BookingRequestContainer />} />
    <Route path="/bookings" element={<BookingsPageContainer />} />
    <Route path="/bookings/:id" element={<BookingContainer />} />
    <Route path="/teams" element={<TeamManagementPage />} />
    <Route path="/land-transport-config" element={<LandTransportConfigPage />} />
    <Route
      path="/land-transport-config/:providerId"
      element={<LandTransportConfigProviderPage />}
    />
    <Route path="/opportunities-config" element={<OpportunitiesConfigPage />} />
    <Route path="/charges/*" element={<AdminSideCharges />} />
    <Route path="/vessel" element={<VesselWithVoyagePage />} />
    <Route path="/land-transport" element={<LandTransportPage />} />
    <Route path="/loadList" element={<LoadListPage />} />
    <Route path="/equipment-control" element={<EquipmentControlPage />} />
    <Route path="/my-day" element={<MyDayPage />} />
    <Route path="/my-profile" element={<MyProfilePage />} />
    <Route path="/equipment" element={<EquipmentSituation />} />
    <Route path="/weekly-payment" element={<WeeklyPaymentPage />} />
    <Route path="/commissions" element={<CommissionsPage />} />
    <Route path="/not-found" element={<NotFound />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const userRoutes = (
  <Routes>
    <Route path="/" element={<Dashboard />} />
    <Route path="/schedule" element={<RoutesPage />} />
    <Route path="/quotes/groups" element={<QuoteGroups />} />
    <Route path="/quotes/groups/:id" element={<QuoteGroup />} />
    <Route path="/quotes/get" element={<GetQuotes />} />
    <Route path="/quotes/:id" element={<QuotePageContainer />} />
    <Route path="/online-booking" element={<OnlineBookingPage />} />
    <Route path="/booking-requests/:id" element={<BookingRequestContainer />} />
    <Route path="/bookings" element={<BookingsPageContainer />} />
    <Route path="/bookings/:id" element={<BookingContainer />} />
    <Route path="/equipment" element={<EquipmentSituation />} />
    <Route path="/my-day" element={<MyDayPage />} />
    <Route path="/my-profile" element={<MyProfilePage />} />
    <Route path="/charges/*" element={<SideCharges />} />
    <Route path="/not-found" element={<NotFound />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const UserRoutes: React.FC = () => {
  const userRecord = useContext(UserRecord);
  const [actingAs] = useContext(ActingAs);

  useAntiTrust().then(() => {});

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
  const navigate = useNavigate();
  const location = useLocation();
  const [state] = useContext(GlobalContext);
  const { isGlobalLoadingInProgress } = state;

  // If we come from email notification, we want to read that notification and delete it from url
  useEffect(() => {
    const params = queryString.parse(window.location.search);

    if (params.readNotification && userRecord) {
      const notificationId = params.readNotification as string;

      if (params.checklistTab) {
        setLastOpenedChecklistTab(`${params.checklistTab as string}`, user.uid)
          .then(() => delete params.checklistTab)
          .then(() => {
            //read that notification
            notificationSeenStatusChange(
              notificationId,
              userRecord,
              NotificationStatusAction.READ_NOTIFICATION,
            ).then(() => {
              delete params.readNotification;
              navigate(`${location.pathname}?${queryString.stringify(params)}`);
            });
          });
      } else {
        //read that notification
        notificationSeenStatusChange(
          notificationId,
          userRecord,
          NotificationStatusAction.READ_NOTIFICATION,
        ).then(() => {
          delete params.readNotification;
          navigate(`${location.pathname}?${queryString.stringify(params)}`);
        });
      }
    }
  }, [location]);

  return (
    <Fragment>
      <QuoteFilterListProvider>
        <TaskFilterProvider>
          <BookingListPaginationProvider>
            <BookingListFilterProvider>
              <BookingRequestsFilterProvider>
                <Navbar />
                <Backdrop className={classes.backdrop} open={isGlobalLoadingInProgress}>
                  <CircularProgress color="inherit" />
                </Backdrop>
                <div className={classes.deviceControl}>
                  {user === undefined ? (
                    <ChartsCircularProgress />
                  ) : user === null ? (
                    anonymousRoutes
                  ) : (
                    <UserRoutes />
                  )}
                </div>
                <ScrollToTop className={classes.goTop} />
                {import.meta.env.VITE_BRAND === 'brunoni' ? (
                  <BrunoniFooter />
                ) : import.meta.env.VITE_BRAND === 'allmarine' ? (
                  <AllmarineFooter />
                ) : null}
              </BookingRequestsFilterProvider>
            </BookingListFilterProvider>
          </BookingListPaginationProvider>
        </TaskFilterProvider>
      </QuoteFilterListProvider>
    </Fragment>
  );
};

export default App;
