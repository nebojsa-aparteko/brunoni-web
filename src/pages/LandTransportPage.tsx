import React, { Fragment } from 'react';
import Meta from '../components/Meta';
import { Box, createStyles, makeStyles } from '@material-ui/core';
import LandTransportSearch from '../components/landTransport/LandTransportSearch';
import LandTransportResults from '../components/landTransport/LandTransportResults';

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
  }),
);

const LandTransportPage = () => {
  const classes = useStyles();

  return (
    <Fragment>
      <Meta title="Land Transport" />
      <Box className={classes.container}>
        <LandTransportSearch />
        <LandTransportResults />
      </Box>
    </Fragment>
  );
};

export default LandTransportPage;
