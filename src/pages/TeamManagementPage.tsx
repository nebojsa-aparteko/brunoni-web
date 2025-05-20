import React, { Fragment, useState } from 'react';
import Meta from '../components/Meta';
import { Box, makeStyles, Paper, Tab, Tabs, Theme } from '@material-ui/core';
import { TabPanel } from './BookingsPage';
import PeopleIcon from '@material-ui/icons/People';
import PersonIcon from '@material-ui/icons/Person';
import ReceiptIcon from '@material-ui/icons/Receipt';
import RecentActorsIcon from '@material-ui/icons/RecentActors';
import TeamsUsersContainer from '../components/teams/TeamsUsersContainer';
import TeamsTeamsContainer from '../components/teams/TeamsTeamsContainer';
import ReassignUsersContainer from '../components/teams/ReassignUsersContainer';
import TeamsPaymentConfirmationContainer from '../components/teams/TeamsPaymentConfirmationContainer';
import { useHistory } from 'react-router';
import queryString from 'query-string';

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
    id: `scrollable-prevent-tab-${index}`,
    'aria-controls': `scrollable-prevent-tabpanel-${index}`,
  };
}

const TeamManagementPage: React.FC = () => {
  const classes = useStyles();
  const history = useHistory();
  const params = queryString.parse(window.location.search.replace('?', ''));
  const tab = params.tab as string | undefined;

  const tabToIndex: any = {
    users: 1,
    'reassign-users': 2,
    'payment-confirmation': 3,
  };

  const [selectedTab, setSelectedTab] = useState(tab && tabToIndex[tab] ? tabToIndex[tab] : 0);

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
    switch (newValue) {
      case 0:
        history.push('/teams');
        break;
      case 1:
        history.push('/teams?tab=users');
        break;
      case 2:
        history.push('/teams?tab=reassign-users');
        break;
      case 3:
        history.push('/teams?tab=payment-confirmation');
        break;
      default:
        break;
    }
  };

  return (
    <Fragment>
      <Meta title="Team Management" />
      <Box className={classes.tabContainer} style={{ overflowY: 'hidden' }}>
        <Paper square>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            orientation="vertical"
            aria-label="Team management tabs"
            className={classes.tabs}
          >
            <Tab icon={<PeopleIcon />} label="Teams" {...a11yProps(0)} />
            <Tab icon={<PersonIcon />} label="Users" {...a11yProps(1)} />
            <Tab icon={<RecentActorsIcon />} label="Reassign users" {...a11yProps(2)} />
            <Tab icon={<ReceiptIcon />} label="Payment confirmation" {...a11yProps(3)} />
          </Tabs>
        </Paper>
        <TabPanel value={selectedTab} index={0}>
          <TeamsTeamsContainer />
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          <TeamsUsersContainer />
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          <ReassignUsersContainer />
        </TabPanel>

        <TabPanel value={selectedTab} index={3}>
          <TeamsPaymentConfirmationContainer />
        </TabPanel>
      </Box>
    </Fragment>
  );
};

export default TeamManagementPage;
