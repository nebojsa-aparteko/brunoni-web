import ArchiveIcon from '@material-ui/icons/Archive';
import React, { Fragment, useContext, useState } from 'react';
import BookingsView from '../components/BookingsView';
import { Box, makeStyles, Tab, Tabs, Theme, Typography } from '@material-ui/core';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import PaymentIcon from '@material-ui/icons/Payment';
import TocIcon from '@material-ui/icons/Toc';
import Meta from '../components/Meta';
import { useBookingsContext, useBookingsFilterDispatch } from '../providers/BookingsProvider';
import ActingAs from '../contexts/ActingAs';
import { BookingListFilterProvider } from '../providers/BookingListFilterProvider';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: theme.spacing(2),
    maxWidth: theme.breakpoints.values.lg,
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

function a11yProps(index: any) {
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

const BookingsPage: React.FC = () => {
  const classes = useTabStyles();
  const [selectedTab, setSelectedTab] = useState(0);
  const actingAs = useContext(ActingAs)[0];

  const bookingFilterDispach = useBookingsFilterDispatch();

  const [bookings, filters] = useBookingsContext();

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
    switch (newValue) {
      case 0:
        bookingFilterDispach({ type: 'set', field: 'archived', value: false });
        bookingFilterDispach({ type: 'set', field: 'pendingPayment', value: false });
        bookingFilterDispach({ type: 'clear', field: 'dateRange' });
        break;
      case 1:
        bookingFilterDispach({ type: 'set', field: 'archived', value: false });
        bookingFilterDispach({ type: 'set', field: 'pendingPayment', value: true });
        bookingFilterDispach({ type: 'clear', field: 'dateRange' });
        break;
      case 2:
        bookingFilterDispach({ type: 'set', field: 'archived', value: true });
        bookingFilterDispach({ type: 'set', field: 'pendingPayment', value: undefined });
        break;
      default:
        break;
    }
  };

  return (
    <Fragment>
      <BookingListFilterProvider>
        <Meta title="Bookings" />
        {!actingAs ? (
          <Box className={classes.tabContainer}>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              orientation="vertical"
              aria-label="Booking tabs"
              className={classes.tabs}
            >
              <Tab icon={<FileCopyIcon />} label="Active" {...a11yProps(0)} />
              <Tab icon={<PaymentIcon />} label="Pending Payment" {...a11yProps(1)} />
              <Tab icon={<ArchiveIcon />} label="Archived" {...a11yProps(2)} />
              <Tab icon={<TocIcon />} label="Loading List" {...a11yProps(3)} />
            </Tabs>
            <TabPanel value={selectedTab} index={0}>
              <BookingsView bookings={bookings || []} bookingContextFilters={filters} isAdmin={!actingAs} />
            </TabPanel>
            <TabPanel value={selectedTab} index={1}>
              <BookingsView bookings={bookings || []} bookingContextFilters={filters} isAdmin={!actingAs} />
            </TabPanel>
            <TabPanel value={selectedTab} index={2}>
              <BookingsView
                bookings={bookings || []}
                bookingContextFilters={filters}
                isAdmin={!actingAs}
                archived
                showDateRangeFilter
              />
            </TabPanel>
            <TabPanel value={selectedTab} index={3}>
              <Typography variant="h3">...Coming soon ..</Typography>
            </TabPanel>
          </Box>
        ) : (
          <BookingsView bookings={bookings || []} bookingContextFilters={filters} showDateRangeFilter />
        )}
      </BookingListFilterProvider>
    </Fragment>
  );
};

export default BookingsPage;
