import React from 'react';
import LandTransportFare from './LandTransportFare';
import { Box, makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    '& > *:not(:last-child)': {
      marginBottom: theme.spacing(2),
    },
  },
}));

const LandTransportFareCollection: React.FC<Props> = ({ collection }) => {
  const classes = useStyles();

  return (
    <Box className={classes.container}>
      {collection.map((fare, i) => (
        <LandTransportFare key={i} />
      ))}
    </Box>
  );
};

interface Props {
  collection: string[];
}

export default LandTransportFareCollection;
