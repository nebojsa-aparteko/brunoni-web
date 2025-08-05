import React, { Fragment, useState, useEffect } from 'react';
import { Badge, Box, makeStyles, Paper, Tab, Tabs, Theme } from '@material-ui/core';
import Meta from '../components/Meta';
import AssessmentIcon from '@material-ui/icons/Assessment';
import HelpIcon from '@material-ui/icons/Help';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import OpportunitiesFilterProvider from '../providers/OpportunitiesFilterProvider';
import ManualMatchingFilterProvider from '../providers/ManualMatchingFilterProvider';
import OpportunitiesView from '../components/opportunities/OpportunitiesView';
import ManualMatchingView from '../components/opportunities/ManualMatchingView';
// import OpportunityTasksView from '../components/opportunities/OpportunityTasksView';
// import useOverdueTasksCount from '../hooks/useOverdueTasksCount';
import queryString from 'query-string';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => ({
  tabContainer: {
    flex: 1,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  tabPanel: {
    margin: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    width: '100%',
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const classes = useStyles();
  const { children, value, index, ...other } = props;

  return (
    <Box
      className={classes.tabPanel}
      role="tabpanel"
      hidden={value !== index}
      id={`opportunities-tabpanel-${index}`}
      aria-labelledby={`opportunities-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </Box>
  );
}

function a11yProps(index: any) {
  return {
    id: `opportunities-tab-${index}`,
    'aria-controls': `opportunities-tabpanel-${index}`,
  };
}

const OpportunitiesPage: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  //   const { count: overdueTasksCount } = useOverdueTasksCount();

  const params = queryString.parse(window.location.search.replace('?', ''));
  const tab = params.tab as string | undefined;

  const tabToIndex: any = {
    'manual-matching': 1,
    tasks: 2,
  };

  const indexToTab: any = {
    1: 'manual-matching',
    2: 'tasks',
  };

  const [selectedTab, setSelectedTab] = useState(tab && tabToIndex[tab] ? tabToIndex[tab] : 0);

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);

    switch (newValue) {
      case 0:
        navigate('/opportunities');
        break;
      case 1:
        navigate('/opportunities?tab=manual-matching');
        break;
      case 2:
        navigate('/opportunities?tab=tasks');
        break;
      default:
        navigate('/opportunities');
        break;
    }
  };

  useEffect(() => {
    const newValue = tab && tabToIndex[tab] ? tabToIndex[tab] : 0;
    setSelectedTab(newValue);
  }, []);

  return (
    <Fragment>
      <Meta title="Opportunities" />
      <OpportunitiesFilterProvider>
        <Box className={classes.tabContainer} style={{ maxWidth: '100vw', overflowY: 'hidden' }}>
          <Paper square>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              orientation="vertical"
              aria-label="Opportunities tabs"
              className={classes.tabs}
            >
              <Tab icon={<AssessmentIcon />} label="Opportunities" {...a11yProps(0)} />
              <Tab icon={<HelpIcon />} label="Manual Matching" {...a11yProps(1)} />
              <Tab
                icon={
                  <Badge
                    badgeContent={overdueTasksCount > 0 ? overdueTasksCount : null}
                    color="error"
                    max={99}
                  >
                    <CheckCircleIcon />
                  </Badge>
                }
                label="Tasks"
                {...a11yProps(2)}
              />
            </Tabs>
          </Paper>
          <TabPanel value={selectedTab} index={0}>
            <OpportunitiesView isAdmin={true} />
          </TabPanel>
          <TabPanel value={selectedTab} index={1}>
            <ManualMatchingFilterProvider>
              <ManualMatchingView isAdmin={true} />
            </ManualMatchingFilterProvider>
          </TabPanel>
          <TabPanel value={selectedTab} index={2}>
            <OpportunityTasksView />
          </TabPanel>
        </Box>
      </OpportunitiesFilterProvider>
    </Fragment>
  );
};

export default OpportunitiesPage;
