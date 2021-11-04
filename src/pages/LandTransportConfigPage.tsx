import React, { Fragment } from 'react';
import Meta from '../components/Meta';
import { Box, makeStyles, Tab, Tabs } from '@material-ui/core';
import ProviderConfigMain from '../components/landTransport/config/ProviderConfigMain';
import TabPanel from '../components/TabPanel';

const useStyles = makeStyles(() => ({
  mainContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'start',
  },
  companyListContainer: {
    width: '500px',
    height: '500px',
    backgroundColor: 'grey',
  },
  tabPanel: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fff',
  },
}));

function a11yProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const LandTransportConfigPage: React.FC = () => {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };

  return (
    <Fragment>
      <Meta title={'Land Transport Config'} />
      <Box className={classes.mainContainer}>
        <Tabs className={classes.tabPanel} value={value} orientation="vertical" onChange={handleChange}>
          <Tab label="Contargo" {...a11yProps(0)} />
          <Tab label="SwissTerminal" {...a11yProps(1)} />
          <Tab label="Hamburg Sud" aria-label="sdasdasd" {...a11yProps(2)} />
        </Tabs>
        <TabPanel index={0} value={value}>
          <ProviderConfigMain name="Contargo" />
        </TabPanel>
        <TabPanel index={1} value={value}>
          <ProviderConfigMain name="SwissTerminal" />
        </TabPanel>
        <TabPanel index={2} value={value}>
          <ProviderConfigMain name="Hamburg Sud" />
        </TabPanel>
      </Box>
    </Fragment>
  );
};

export default LandTransportConfigPage;
