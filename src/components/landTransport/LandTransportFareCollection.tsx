import React, { useContext, useMemo } from 'react';
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
  const grouped = useMemo(() => Object.entries(groupBy(landTransports, 'props.transportMode[0]')), [landTransports]);
  return (
    <Box className={classes.container}>
      {grouped.map(([key, value], i) => {
        return <LandTransportFare key={i} grouped={value} />;
      })}
    </Box>
  );
};

export default LandTransportFareCollection;
