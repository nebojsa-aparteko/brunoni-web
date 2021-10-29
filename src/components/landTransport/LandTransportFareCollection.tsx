import React, { useContext } from 'react';
import LandTransportFare from './LandTransportFare';
import { Box, makeStyles, Theme } from '@material-ui/core';
import { LandTransportContext } from '../../providers/LandTransportProvider';

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
  console.log(landTransports);
  return (
    <Box className={classes.container}>
      {landTransports?.map((fare, i) =>
        fare.map(f => (
          // <Typography>
          //   {f.start.properties.name} {f.end.properties.name}
          // </Typography>
          <LandTransportFare key={`${i}`} {...f} />
        )),
      )}
    </Box>
  );
};

export default LandTransportFareCollection;
