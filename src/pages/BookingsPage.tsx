import ArchiveIcon from '@material-ui/icons/Archive';
import React, { CSSProperties, Fragment, useCallback, useContext, useEffect } from 'react';
import BookingsView from '../components/BookingsView';
import { Box, makeStyles, Tab, Tabs, Theme } from '@material-ui/core';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import PaymentIcon from '@material-ui/icons/Payment';
import Meta from '../components/Meta';
import BookingsProvider, { useBookingsContext } from '../providers/BookingsProvider';
import ActingAs from '../contexts/ActingAs';
import { useBookingListFilterContext } from '../providers/BookingListFilterProvider';
import { INITIAL_DATERANGE_FILTER, LAST_3_MONTHS } from '../providers/filterActions';
import set from 'lodash/fp/set';
import flow from 'lodash/fp/flow';
import { useBookingListPaginationContext } from '../providers/BookingListPaginationProvider';

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
  const [bookingPaginationContextData, setBookingPaginationContextData] = useBookingListPaginationContext();
  const selectedTab = bookingPaginationContextData.activeTab;

  const [bookings, isLoading] = useBookingsContext();

  // Remember scroll position
  useEffect(() => {
    if (bookingPaginationContextData.scrollPosition && !isLoading) {
      window.scroll(0, bookingPaginationContextData.scrollPosition);
    }

    return () => {
      // as it will be remounted a few times we do not want to store position if the scroll did not actually happen
      if (window.scrollY > 200 && setBookingPaginationContextData) {
        setBookingPaginationContextData(set('scrollPosition', window.scrollY)(bookingPaginationContextData));
      }
    };
  }, [isLoading, bookingPaginationContextData, setBookingPaginationContextData]);

  const setSelectedTab = useCallback(
    (event: React.ChangeEvent<{}>, newValue: number) => {
      if (setBookingPaginationContextData) {
        setBookingPaginationContextData(set('activeTab', newValue)(bookingPaginationContextData));
      }
    },
    [bookingPaginationContextData, setBookingPaginationContextData],
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
          default:
            return bookingsContextData;
        }
      };

      if (setBookingsContextData) {
        setBookingsContextData(set('activeTab', newValue)(bookingsContextDataNew()));
      }
    },
    [setBookingsContextData, bookingsContextData],
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
    [setBookingsContextData, bookingsContextData],
  );

  useEffect(() => {
    if (bookingsContextData.activeTab !== bookingPaginationContextData.activeTab) {
      if (!actingAs) {
        handleTabChange(bookingPaginationContextData.activeTab);
      } else {
        handleCustomerTabChange(bookingPaginationContextData.activeTab);
      }
    }
  }, [
    bookingPaginationContextData.activeTab,
    actingAs,
    bookingsContextData.activeTab,
    handleCustomerTabChange,
    handleTabChange,
  ]);

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
  }, [actingAs, setBookingsContextData, bookingsContextData]);

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
          </Tabs>
          <TabPanel value={selectedTab} index={0}>
            <BookingsView bookings={isLoading ? undefined : bookings} isAdmin={!actingAs} />
          </TabPanel>
          <TabPanel value={selectedTab} index={1}>
            <BookingsView bookings={isLoading ? undefined : bookings} isAdmin={!actingAs} />
          </TabPanel>
          <TabPanel value={selectedTab} index={2}>
            <BookingsView
              bookings={isLoading ? undefined : bookings}
              isAdmin={!actingAs}
              archived
              showDateRangeFilter
            />
          </TabPanel>
        </Box>
      ) : (
        <Box className={classes.tabContainer}>
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
          <TabPanel value={selectedTab} index={0}>
            <BookingsView bookings={isLoading ? undefined : bookings} isAdmin={!actingAs} />
          </TabPanel>
          <TabPanel value={selectedTab} index={1}>
            <BookingsView
              bookings={isLoading ? undefined : bookings}
              isAdmin={!actingAs}
              archived
              showDateRangeFilter
            />
          </TabPanel>
        </Box>
      )}
    </Fragment>
  );
};

const BookingsPage = () => {
  return (
    <BookingsProvider>
      <BookingsPageContainer />
    </BookingsProvider>
  );
};

export default BookingsPage;
