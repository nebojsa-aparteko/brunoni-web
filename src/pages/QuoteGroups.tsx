import React, { Fragment, useContext, useState } from 'react';
import QuoteGroupsView from '../components/QuoteGroupsView';
import Container from '@material-ui/core/Container';
import { Box, makeStyles, Tab, Tabs, Theme } from '@material-ui/core';
import Meta from '../components/Meta';
import ActingAs from '../contexts/ActingAs';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import PaymentIcon from '@material-ui/icons/Payment';
import ArchiveIcon from '@material-ui/icons/Archive';
import TocIcon from '@material-ui/icons/Toc';
import BookingsView from '../components/BookingsView';
import { TabPanel } from './BookingsPage';
import { useBookingsContext, useBookingsFilterDispatch } from '../providers/BookingsProvider';
import { INITIAL_DATERANGE_FILTER, useQuotesFilterDispatch } from '../providers/QuotesProvider';
import QuoteGroupsContext from '../contexts/QuoteGroupsContext';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },
  tabContainer: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

function a11yProps(index: any) {
  return {
    id: `quotes-prevent-tab-${index}`,
    'aria-controls': `quotes-prevent-tabpanel-${index}`,
  };
}

const QuoteGroups: React.FC = () => {
  const classes = useStyles();

  const [selectedTab, setSelectedTab] = useState(0);
  const actingAs = useContext(ActingAs)[0];

  const quoteFilterDispach = useQuotesFilterDispatch();

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
    switch (newValue) {
      case 0:
        quoteFilterDispach({ type: 'set', field: 'archived', value: false });
        quoteFilterDispach({ type: 'clear', field: 'dateRange' });
        break;
      case 1:
        quoteFilterDispach({ type: 'set', field: 'archived', value: true });
        quoteFilterDispach({ type: 'set', field: 'dateRange', value: INITIAL_DATERANGE_FILTER });
        break;
      default:
        break;
    }
  };

  return (
    <Fragment>
      <Meta title="Quotes" />

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
            <Tab icon={<ArchiveIcon />} label="Archived" {...a11yProps(1)} />
          </Tabs>
          <TabPanel value={selectedTab} index={0}>
            <QuoteGroupsView showCompanyInfo />
          </TabPanel>
          <TabPanel value={selectedTab} index={1}>
            <QuoteGroupsView showDateFilter={true} showCompanyInfo />
          </TabPanel>
        </Box>
      ) : (
        <Container maxWidth="xl" className={classes.root}>
          <QuoteGroupsView showGetQuoteButton showDateFilter={true} />
        </Container>
      )}
    </Fragment>
  );
};

export default QuoteGroups;
