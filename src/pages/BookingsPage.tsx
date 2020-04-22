import ArchiveIcon from '@material-ui/icons/Archive';
import React, { Fragment, useContext, useState } from 'react';
import BookingsView from '../components/Bookings';
import Container from '@material-ui/core/Container';
import { AppBar, makeStyles, Tab, Tabs, Theme } from '@material-ui/core';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import Meta from '../components/Meta';
import Bookings from '../contexts/Bookings';
import { useBookingsFilterDispatch } from '../providers/BookingsProvider';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
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

function TabPanel(props: TabPanelProps) {
  const classes = useStyles();
  const { children, value, index } = props;

  return (
    <Fragment>
      <Container maxWidth="lg" className={classes.root}>
        {value === index && children}
      </Container>
    </Fragment>
  );
}

const BookingsPage: React.FC = () => {
  const classes = useTabStyles();
  const [selectedTab, setSelectedTab] = useState(0);

  const bookingFilterDispach = useBookingsFilterDispatch();

  const bookings = useContext(Bookings);

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
    bookingFilterDispach({ type: 'set', field: 'archived', value: newValue !== 0 });
  };

  return (
    <Fragment>
      <Meta title="Bookings" />
      <div className={classes.tabContainer}>
        <AppBar>
          <Tabs value={selectedTab} onChange={handleTabChange} className={classes.tabs}>
            <Tab icon={<FileCopyIcon />} label="Active" />
            <Tab icon={<ArchiveIcon />} label="Archived" />
          </Tabs>
        </AppBar>
        <TabPanel value={selectedTab} index={0}>
          <BookingsView bookings={bookings || []} />
        </TabPanel>
        <TabPanel value={selectedTab} index={1}>
          <BookingsView bookings={bookings || []} />
        </TabPanel>
      </div>
    </Fragment>
  );
};

export default BookingsPage;
