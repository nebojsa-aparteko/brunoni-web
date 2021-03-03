import React, { useState } from 'react';
import { Box, makeStyles, Paper, Tab, Tabs, Theme } from '@material-ui/core';
import PeopleIcon from '@material-ui/icons/People';
import PersonIcon from '@material-ui/icons/Person';
import RecentActorsIcon from '@material-ui/icons/RecentActors';
// import {a11yProps, TabPanel} from "../../pages/BookingsPage";
import ImportFlowsContainer from './ImportFlowsContainer';
import ExportFlowsContainer from './ExportFlowsContainer';
import OverviewsContainer from './OverviewsContainer';
import BookingsVsStockContainer from './BookingsVsStockContainer';
import EquipmentBookingDetailsContainer from './EquipmentBookingDetailsContainer';

const useStyles = makeStyles((theme: Theme) => ({
  tabContainer: {
    flex: 1,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));
//TODO extract this as a component
interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={3}>{value === index && children}</Box>}
    </div>
  );
}

function a11yProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const EquipmentControlContainer = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const classes = useStyles();

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <Paper>
      <Box className={classes.tabContainer} flexDirection="column" style={{ maxWidth: '100vw', overflowY: 'hidden' }}>
        <Paper square>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            orientation="horizontal"
            aria-label="Equipment control tabs"
            className={classes.tabs}
          >
            <Tab icon={<PeopleIcon />} label="Import Flows" {...a11yProps(0)} />
            <Tab icon={<PeopleIcon />} label="Export Flows" {...a11yProps(1)} />
            <Tab icon={<PersonIcon />} label="Overviews" {...a11yProps(2)} />
            <Tab icon={<RecentActorsIcon />} label="Bookings vs Stock" {...a11yProps(3)} />
            <Tab icon={<PeopleIcon />} label="Booking Details" {...a11yProps(4)} />
          </Tabs>
        </Paper>
        <TabPanel value={selectedTab} index={0}>
          <ImportFlowsContainer />
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          <ExportFlowsContainer />
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          <OverviewsContainer />
        </TabPanel>

        <TabPanel value={selectedTab} index={3}>
          <BookingsVsStockContainer />
        </TabPanel>

        <TabPanel value={selectedTab} index={4}>
          <EquipmentBookingDetailsContainer />
        </TabPanel>
      </Box>
    </Paper>
  );
};

export default EquipmentControlContainer;
