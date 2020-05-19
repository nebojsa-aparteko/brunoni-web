import ArchiveIcon from '@material-ui/icons/Archive';
import React, { Fragment, useContext, useEffect } from 'react';
import BookingsView from '../components/BookingsView';
import { Box, Container, makeStyles, Tab, Tabs, Theme } from '@material-ui/core';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import PaymentIcon from '@material-ui/icons/Payment';
import Meta from '../components/Meta';
import BookingsProvider, { useBookingsContext } from '../providers/BookingsProvider';
import ActingAs from '../contexts/ActingAs';
import { BOOKING_FILTERS_INITIAL_STATE, BookingListFilterContext } from '../providers/BookingListFilterProvider';
import { INITIAL_DATERANGE_FILTER, LAST_3_MONTHS } from '../providers/filterActions';
import set from 'lodash/fp/set';
import flow from 'lodash/fp/flow';

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
}

export function a11yProps(index: any) {
  return {
    id: `scrollable-prevent-tab-${index}`,
    'aria-controls': `scrollable-prevent-tabpanel-${index}`,
  };
}

export function TabPanel(props: TabPanelProps) {
  const classes = useStyles();
  const { children, value, index, ...other } = props;

  return (
    <Box
      className={classes.root}
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-prevent-tabpanel-${index}`}
      aria-labelledby={`scrollable-prevent-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </Box>
  );
}

const BookingsPageContainer: React.FC = () => {
  const classes = useTabStyles();
  const actingAs = useContext(ActingAs)[0];

  const [bookingsContextData, setBookingsContextData] = useContext(BookingListFilterContext);
  const selectedTab = bookingsContextData.activeTab;

  const [bookings, isLoading, filters, setFilters] = useBookingsContext();

  // Remember scroll position
  useEffect(() => {
    if (bookingsContextData.scrollPosition && !isLoading) {
      window.scroll(0, bookingsContextData.scrollPosition);
    }

    return () => {
      // as it will be remounted a few times we do not want to store position if the scroll did not actually happen
      if (window.scrollY > 200) {
        setBookingsContextData(set('scrollPosition', window.scrollY)(bookingsContextData));
      }
    };
  }, [isLoading, bookingsContextData.scrollPosition]);

  useEffect(() => {
    handleTabChange(bookingsContextData.activeTab);
  }, [bookingsContextData.activeTab]);

  const setSelectedTab = (event: React.ChangeEvent<{}>, newValue: number) => {
    setBookingsContextData(set('activeTab', newValue)(bookingsContextData));
  };

  const handleTabChange = (newValue: number) => {
    setBookingsContextData(set('scrollPosition', 0)(bookingsContextData));
    if (newValue !== bookingsContextData.activeTab && setBookingsContextData) {
      setBookingsContextData(BOOKING_FILTERS_INITIAL_STATE);
    }

    switch (newValue) {
      case 0:
        setFilters &&
          setFilters(flow(set('archived', false), set('pendingPayment', false), set('dateRange', undefined))(filters));
        break;
      case 1:
        setFilters &&
          setFilters(flow(set('archived', false), set('pendingPayment', true), set('dateRange', undefined))(filters));
        break;
      case 2:
        setFilters &&
          setFilters(
            flow(
              set('archived', true),
              set('pendingPayment', undefined),
              set('dateRange', filters.dateRange || INITIAL_DATERANGE_FILTER),
            )(filters),
          );
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (actingAs) {
      // we are acting as a customer set a date range:
      setFilters &&
        setFilters(
          flow(
            set('archived', undefined),
            set('pendingPayment', undefined),
            set('dateRange', filters.dateRange || LAST_3_MONTHS),
          )(filters),
        );
    }
  }, [actingAs, setFilters]);

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
            <BookingsView
              bookings={isLoading ? undefined : bookings}
              bookingContextFilters={filters}
              isAdmin={!actingAs}
            />
          </TabPanel>
          <TabPanel value={selectedTab} index={1}>
            <BookingsView
              bookings={isLoading ? undefined : bookings}
              bookingContextFilters={filters}
              isAdmin={!actingAs}
            />
          </TabPanel>
          <TabPanel value={selectedTab} index={2}>
            <BookingsView
              bookings={isLoading ? undefined : bookings}
              bookingContextFilters={filters}
              isAdmin={!actingAs}
              archived
              showDateRangeFilter
            />
          </TabPanel>
        </Box>
      ) : (
        <Container maxWidth="lg">
          <BookingsView bookings={bookings} bookingContextFilters={filters} showDateRangeFilter />
        </Container>
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
