import React, { Fragment, useContext, useEffect, useState } from 'react';
import QuoteGroupsView from '../components/QuoteGroupsView';
import Container from '@material-ui/core/Container';
import { Box, makeStyles, Tab, Tabs, Theme } from '@material-ui/core';
import Meta from '../components/Meta';
import ActingAs from '../contexts/ActingAs';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import ArchiveIcon from '@material-ui/icons/Archive';
import { TabPanel } from './BookingsPage';
import { useQuotesContext } from '../providers/QuotesProvider';
import { INITIAL_DATERANGE_FILTER } from '../providers/filterActions';
import flow from 'lodash/fp/flow';
import set from 'lodash/fp/set';

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

  const [_, isLoading, quoteFilters, setQuoteFilters] = useQuotesContext();

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
    switch (newValue) {
      case 0:
        setQuoteFilters && setQuoteFilters(flow(set('archived', false), set('dateRange', undefined))(quoteFilters));
        break;
      case 1:
        setQuoteFilters &&
          setQuoteFilters(
            flow(
              set('archived', true),
              set('dateRange', quoteFilters.dateRange || INITIAL_DATERANGE_FILTER),
            )(quoteFilters),
          );
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (actingAs) {
      // we are acting as a customer set a date range:
      setQuoteFilters &&
        setQuoteFilters(
          flow(
            set('archived', undefined),
            set('dateRange', quoteFilters.dateRange || INITIAL_DATERANGE_FILTER),
          )(quoteFilters),
        );
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
