import React, { Fragment } from 'react';
import Meta from '../components/Meta';
import { Box, Button, makeStyles, Tab, Tabs } from '@material-ui/core';
import ProviderConfigMain from '../components/landTransport/config/ProviderConfigMain';
import TabPanel from '../components/TabPanel';
import useLandTransportProviders from '../hooks/useLandTransportProviders';
import { addLandTransportProvider } from '../api/landTransportConfig';

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

// const providers = ['Contargo', 'SwissTerminal', 'Hamburg Süd'];

const LandTransportConfigPage: React.FC = () => {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const providers = useLandTransportProviders();
  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };

  return (
    <Fragment>
      <Meta title={'Land Transport Config'} />
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          addLandTransportProvider({ name: 'Test' });
        }}
      >
        Add Provider
      </Button>
      <Box className={classes.mainContainer}>
        <Tabs className={classes.tabPanel} value={value} orientation="vertical" onChange={handleChange}>
          {providers?.map((provider, index) => (
            <Tab label={provider.name} {...a11yProps(index)} />
          ))}
        </Tabs>
        {providers?.map((provider, index) => (
          <TabPanel index={index} value={value}>
            <ProviderConfigMain name={provider.name} />
          </TabPanel>
        ))}
      </Box>
    </Fragment>
  );
};

export default LandTransportConfigPage;
