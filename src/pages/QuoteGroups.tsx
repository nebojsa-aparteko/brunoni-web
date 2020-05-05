import React, { Fragment, useContext, useEffect, useState } from 'react';
import QuoteGroupsView from '../components/QuoteGroupsView';
import Container from '@material-ui/core/Container';
import { Box, makeStyles, Tab, Tabs, Theme } from '@material-ui/core';
import Meta from '../components/Meta';
import ActingAs from '../contexts/ActingAs';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import ArchiveIcon from '@material-ui/icons/Archive';
import { TabPanel } from './BookingsPage';
import { useQuotesFilterDispatch } from '../providers/QuotesProvider';
import { INITIAL_DATERANGE_FILTER } from '../providers/filterActions';

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

  useEffect(() => {
    if (actingAs) {
      // we are acting as a customer set a date range:
      quoteFilterDispach({ type: 'set', field: 'dateRange', value: INITIAL_DATERANGE_FILTER });
      quoteFilterDispach({ type: 'clear', field: 'archived' });
    }
  }, [actingAs]);

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
