import React, { Fragment, useState } from 'react';
import { Box, makeStyles, Paper, Tab, Tabs, Theme } from '@material-ui/core';
import Meta from '../components/Meta';
import BusinessIcon from '@material-ui/icons/Business';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import { TabPanel } from './BookingsPage';
import OpportunitiesFilterProvider from '../providers/OpportunitiesFilterProvider';
import OpportunitiesView from '../components/OpportunitiesView';

const useStyles = makeStyles((theme: Theme) => ({
  tabContainer: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    width: '100%',
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

function a11yProps(index: any) {
  return {
    id: `opportunities-tab-${index}`,
    'aria-controls': `opportunities-tabpanel-${index}`,
  };
}

const OpportunitiesPage: React.FC = () => {
  const classes = useStyles();
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <Fragment>
      <Meta title="Opportunities" />
      <OpportunitiesFilterProvider>
        <Box className={classes.tabContainer} style={{ overflowY: 'hidden' }}>
          <Paper square>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              orientation="vertical"
              aria-label="Opportunities tabs"
              className={classes.tabs}
            >
              <Tab icon={<BusinessIcon />} label="Matched" {...a11yProps(0)} />
              <Tab icon={<TrendingUpIcon />} label="Not Matched" {...a11yProps(1)} />
            </Tabs>
          </Paper>
          <TabPanel value={selectedTab} index={0}>
            <OpportunitiesView isAdmin={true} archived={false} showDateRangeFilter={true} />
          </TabPanel>
          <TabPanel value={selectedTab} index={1}>
            <OpportunitiesView isAdmin={true} archived={false} showDateRangeFilter={true} />
          </TabPanel>
        </Box>
      </OpportunitiesFilterProvider>
    </Fragment>
  );
};

export default OpportunitiesPage;
