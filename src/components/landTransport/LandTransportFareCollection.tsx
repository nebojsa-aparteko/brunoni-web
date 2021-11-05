import React, { useContext } from 'react';
import LandTransportFare from './LandTransportFare';
import { Box, makeStyles, Theme } from '@material-ui/core';
import { LandTransportContext } from '../../providers/LandTransportProvider';
import { groupBy } from 'lodash';

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

const LandTransportFareCollection: React.FC = () => {
  const classes = useStyles();
  const [landTransports] = useContext(LandTransportContext);
  const grouped = groupBy(landTransports, 'props.transportMode[0]');
  console.log(grouped);
  const groupedKeys = Object.keys(grouped);
  console.log(groupedKeys);
  return (
    <Box className={classes.container}>
      {groupedKeys.map((key, i) => {
        return <LandTransportFare key={i} grouped={grouped[key]} />;
      })}
    </Box>
  );
};

export default LandTransportFareCollection;
