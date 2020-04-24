import React, { Fragment, useState } from 'react';
import Meta from '../components/Meta';
import { Box, Container, makeStyles, Paper, Tab, Tabs, Theme, Typography } from '@material-ui/core';
import { TabPanel } from './BookingsPage';
import PeopleIcon from '@material-ui/icons/People';
import PersonIcon from '@material-ui/icons/Person';
import TeamsUsersContainer from '../components/teams/TeamsUsersContainer';

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
  const [selectedTab, setSelectedTab] = useState(0);

  const classes = useStyles();

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
    switch (newValue) {
      case 0:
        break;
      case 1:
        break;
      default:
        break;
    }
  };

  return (
    <Fragment>
      <Meta title="Team Management" />
      <Container maxWidth="lg">
        <Box className={classes.tabContainer}>
          <Paper square>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              orientation="vertical"
              aria-label="Team management tabs"
              className={classes.tabs}
            >
              <Tab icon={<PersonIcon />} label="Users" {...a11yProps(0)} />
              <Tab icon={<PeopleIcon />} label="Teams" {...a11yProps(1)} />
            </Tabs>
          </Paper>
          <TabPanel value={selectedTab} index={0}>
            <TeamsUsersContainer />
          </TabPanel>

          <TabPanel value={selectedTab} index={1}>
            <Typography variant="h3">...Coming soon ..</Typography>
          </TabPanel>
        </Box>
      </Container>
    </Fragment>
  );
};

export default TeamManagementPage;
