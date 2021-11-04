import React, { Fragment } from 'react';
import Meta from '../components/Meta';
import { Box, makeStyles, Typography } from '@material-ui/core';
import ProviderConfigMain from '../components/landTransport/config/ProviderConfigMain';

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
}));

const LandTransportConfigPage: React.FC = () => {
  const classes = useStyles();

  return (
    <Fragment>
      <Meta title={'Land Transport Config'} />
      <Box className={classes.mainContainer}>
        <Box className={classes.companyListContainer}>
          <Typography>Lef side Company List</Typography>
        </Box>
        <ProviderConfigMain />
      </Box>
    </Fragment>
  );
};

export default LandTransportConfigPage;
