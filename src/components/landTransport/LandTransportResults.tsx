import React from 'react';
import { Box, Divider, makeStyles, Theme } from '@material-ui/core';
import LandTransportFilterBar from './LandTransportFilterBar';
import LandTransportFareCollection from './LandTransportFareCollection';
import LandTransportFilterProvider from '../../providers/LandTransportFilterProvider';

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
      <LandTransportFilterProvider>
        <LandTransportFilterBar />
        <Divider className={classes.divider} orientation={'vertical'} flexItem />
        <LandTransportFareCollection />
      </LandTransportFilterProvider>
    </Box>
  );
};

export default LandTransportResults;
