import ArchiveIcon from '@material-ui/icons/Archive';
import React, { CSSProperties, Fragment, useCallback, useContext, useEffect, useState } from 'react';
import BookingsView from '../components/BookingsView';
import { Badge, Box, makeStyles, Tab, Tabs, Theme } from '@material-ui/core';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import PaymentIcon from '@material-ui/icons/Payment';
import Meta from '../components/Meta';
import BookingsProvider from '../providers/BookingsProvider';
import ActingAs from '../contexts/ActingAs';
import { useBookingListFilterContext } from '../providers/BookingListFilterProvider';
import { INITIAL_DATERANGE_FILTER, LAST_3_MONTHS } from '../providers/filterActions';
import set from 'lodash/fp/set';
import flow from 'lodash/fp/flow';
import { useBookingListPaginationContext } from '../providers/BookingListPaginationProvider';
import BookingRequestsProvider, { useBookingRequestsContext } from '../providers/BookingRequestsProvider';
import BookingRequestsView from '../components/bookingRequests/BookingRequestsView';
import AssessmentIcon from '@material-ui/icons/Assessment';
import InputIcon from '@material-ui/icons/Input';
import firebase from 'firebase';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: theme.spacing(2),
    maxWidth: theme.breakpoints.values.xl,
    backgroundColor: theme.palette.background.paper,
    width: '100%',
  },
}));

const useTabStyles = makeStyles((theme: Theme) => ({
  tabContainer: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
  style?: CSSProperties;
}

export function a11yProps(index: any) {
  return {
    id: `scrollable-prevent-tab-${index}`,
    'aria-controls': `scrollable-prevent-tabpanel-${index}`,
  };
}

export function TabPanel(props: TabPanelProps) {
  const classes = useStyles();
  const { children, value, index, style, ...other } = props;

  return (
    <Box
      className={classes.root}
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-prevent-tabpanel-${index}`}
      aria-labelledby={`scrollable-prevent-tab-${index}`}
      style={style}
      {...other}
    >
      {value === index && children}
    </Box>
  );
}

const BookingsPageContainer: React.FC = () => {
  const classes = useTabStyles();
  const actingAs = useContext(ActingAs)[0];

  const [bookingsContextData, setBookingsContextData] = useBookingListFilterContext();
  const [, , , setFilters] = useBookingRequestsContext();
  const [bookingPaginationContextData, setBookingPaginationContextData] = useBookingListPaginationContext();
  const [bookingRequestCount, setBookingRequestCount] = useState(0);
  const selectedTab = bookingPaginationContextData.activeTab;
  useEffect(() => {
    firebase
      .database()
      .ref('/booking-requests-count')
      .on('value', a => setBookingRequestCount(+a.val()));
  }, []);

  // Remember scroll position
  // useEffect(() => {
  //   if (bookingPaginationContextData.scrollPosition && !isLoading) {
  //     window.scroll(0, bookingPaginationContextData.scrollPosition);
  //   }
  //
  //   return () => {
  //     // as it will be remounted a few times we do not want to store position if the scroll did not actually happen
  //     if (window.scrollY > 200 && setBookingPaginationContextData) {
  //       setBookingPaginationContextData(prevState => set('scrollPosition', window.scrollY)(prevState));
  //     }
  //   };
  // }, [isLoading, bookingPaginationContextData.scrollPosition]);

  useEffect(() => {
    if (bookingsContextData.activeTab !== bookingPaginationContextData.activeTab) {
      if (!actingAs) {
        handleTabChange(bookingPaginationContextData.activeTab);
      } else {
        handleCustomerTabChange(bookingPaginationContextData.activeTab);
      }
    }
  }, [bookingPaginationContextData.activeTab]);

  const setSelectedTab = useCallback(
    (event: React.ChangeEvent<{}>, newValue: number) => {
      if (setBookingPaginationContextData) {
        setBookingPaginationContextData(set('activeTab', newValue)(bookingPaginationContextData));
      }
    },
    [bookingPaginationContextData.activeTab],
  );

  const handleTabChange = useCallback(
    (newValue: number) => {
      const bookingsContextDataNew = () => {
        switch (newValue) {
          case 0:
            return flow(
              set('archived', false),
              set('pendingPayment', false),
              set('dateRange', undefined),
            )(bookingsContextData);
          case 1:
            return flow(
              set('archived', false),
              set('pendingPayment', true),
              set('dateRange', undefined),
            )(bookingsContextData);
          case 2:
            return flow(
              set('archived', true),
              set('pendingPayment', undefined),
              set('dateRange', bookingsContextData.dateRange || INITIAL_DATERANGE_FILTER),
            )(bookingsContextData);
          case 3:
            setFilters(prevState => flow(set('archived', false), set('hold', false))(prevState));
            return bookingsContextData;
          case 4:
            setFilters(prevState => flow(set('archived', false), set('hold', false))(prevState));
            return bookingsContextData;
          case 5:
            setFilters(prevState => flow(set('archived', true))(prevState));
            return bookingsContextData;
          default:
            return bookingsContextData;
        }
      };

      if (setBookingsContextData) {
        setBookingsContextData(set('activeTab', newValue)(bookingsContextDataNew()));
      }
    },
    [setBookingsContextData],
  );

  const handleCustomerTabChange = useCallback(
    (newValue: number) => {
      const bookingsContextDataNew = () => {
        switch (newValue) {
          case 0:
            return flow(
              set('archived', false),
              set('pendingPayment', undefined),
              set('dateRange', undefined),
            )(bookingsContextData);
          case 1:
            return flow(
              set('archived', true),
              set('pendingPayment', undefined),
              set('dateRange', bookingsContextData.dateRange || INITIAL_DATERANGE_FILTER),
            )(bookingsContextData);
          default:
            return bookingsContextData;
        }
      };

      if (setBookingsContextData) {
        setBookingsContextData(set('activeTab', newValue)(bookingsContextDataNew()));
      }
    },
    [setBookingsContextData],
  );

  useEffect(() => {
    if (actingAs) {
      // we are acting as a customer set a date range:
      setBookingsContextData &&
        setBookingsContextData(
          flow(
            set('archived', false),
            set('pendingPayment', false),
            set('dateRange', bookingsContextData.dateRange || LAST_3_MONTHS),
          )(bookingsContextData),
        );
    }
  }, [actingAs, setBookingsContextData]);

  return (
    <Fragment>
      <Meta title="Bookings" />
      {!actingAs ? (
        <Box className={classes.tabContainer}>
          <Tabs
            value={selectedTab}
            onChange={setSelectedTab}
            orientation="vertical"
            aria-label="Booking tabs"
            className={classes.tabs}
          >
            <Tab icon={<FileCopyIcon />} label="Active" {...a11yProps(0)} />
            <Tab icon={<PaymentIcon />} label="Pending Payment" {...a11yProps(1)} />
            <Tab icon={<ArchiveIcon />} label="Archived" {...a11yProps(2)} />
            {/*<Divider />*/}
            <Tab
              icon={
                <Badge badgeContent={bookingRequestCount} color="primary">
                  <AssessmentIcon />
                </Badge>
              }
              label="Requests"
              {...a11yProps(3)}
            />
            <Tab icon={<InputIcon />} label="Hold Requests" {...a11yProps(4)} />
            <Tab icon={<InputIcon />} label="Archived Requests" {...a11yProps(5)} />
          </Tabs>
          <TabPanel value={selectedTab} index={0}>
            <BookingsView isAdmin={!actingAs} />
          </TabPanel>
          <TabPanel value={selectedTab} index={1}>
            <BookingsView isAdmin={!actingAs} />
          </TabPanel>
          <TabPanel value={selectedTab} index={2}>
            <BookingsView isAdmin={!actingAs} archived showDateRangeFilter />
          </TabPanel>
          <TabPanel value={selectedTab} index={3}>
            <BookingRequestsView isAdmin={!actingAs} />
          </TabPanel>
          <TabPanel value={selectedTab} index={4}>
            <BookingRequestsView isAdmin={!actingAs} />
          </TabPanel>
          <TabPanel value={selectedTab} index={5}>
            <BookingRequestsView isAdmin={!actingAs} />
          </TabPanel>
        </Box>
      ) : (
        <Box className={classes.tabContainer}>
          <div id="tabsBkgPage">
            <Tabs
              value={selectedTab}
              onChange={setSelectedTab}
              orientation="vertical"
              aria-label="Booking tabs"
              className={classes.tabs}
            >
              <Tab icon={<FileCopyIcon />} label="Active" {...a11yProps(0)} />
              <Tab icon={<ArchiveIcon />} label="History" {...a11yProps(1)} />
            </Tabs>
          </div>
          <TabPanel value={selectedTab} index={0}>
            <BookingsView isAdmin={!actingAs} />
          </TabPanel>
          <TabPanel value={selectedTab} index={1}>
            <BookingsView isAdmin={!actingAs} archived showDateRangeFilter />
          </TabPanel>
        </Box>
      )}
    </Fragment>
  );
};

const BookingsPage = () => {
  return (
    <BookingsProvider>
      <BookingRequestsProvider>
        <BookingsPageContainer />
      </BookingRequestsProvider>
    </BookingsProvider>
  );
};

export default BookingsPage;
