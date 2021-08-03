import React from 'react';
import { Box, Divider, makeStyles, Theme } from '@material-ui/core';
import LandTransportFilterBar from './LandTransportFilterBar';
import LandTransportFareCollection from './LandTransportFareCollection';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    margin: theme.spacing(4),
    width: '70%',
  },
  divider: {
    width: '2px',
    marginRight: theme.spacing(3),
    marginLeft: theme.spacing(3),
  },
}));

const LandTransportResults = () => {
  const classes = useStyles();

  return (
    <Box className={classes.container}>
      <LandTransportFilterBar />
      <Divider className={classes.divider} orientation={'vertical'} flexItem />
      <LandTransportFareCollection collection={['1', '2', '3', '4']} />
    </Box>
  );
};

export default LandTransportResults;
