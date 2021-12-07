import React, { useContext, useState } from 'react';
import { Box, createStyles, makeStyles } from '@material-ui/core';
import { ControlledDateInput } from '../inputs/DateInput';
import { ControlledLandLocationInput } from '../inputs/LandLocationInput';
import { ControlledCheckBox } from '../inputs/CheckBox';
import { LandTransportContext } from '../../providers/LandTransportProvider';

const useStyles = makeStyles(theme =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      margin: '20px',
    },
    body: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      '& > *:not(:last-child)': {
        marginRight: theme.spacing(2),
      },
    },
  }),
);

const LandTransportSearchBar: React.FC = () => {
  const classes = useStyles();

  const [dateOpen, setDateOpen] = useState<boolean>(false);

  const {
    fromLocations,
    toLocations,
    fromLocationInputState,
    setFromLocationInputState,
    toLocationInputState,
    setToLocationInputState,
    loadingLocations,
  } = useContext(LandTransportContext);

  console.log({ fromLocations, toLocations });

  const getNoOptionsText = (locationInputState: string) => {
    return locationInputState.length < 2 ? 'Please enter at least 2 characters' : 'No location found';
  };

  return (
    <Box className={classes.root}>
      <Box className={classes.body}>
        <ControlledLandLocationInput
          label={'From'}
          name={'from'}
          noOptionsText={getNoOptionsText(fromLocationInputState)}
          loading={loadingLocations}
          locations={fromLocations}
          inputValue={fromLocationInputState}
          onInputChange={(_, input) => setFromLocationInputState(input)}
        />
        <ControlledLandLocationInput
          label={'To'}
          name={'to'}
          noOptionsText={getNoOptionsText(toLocationInputState)}
          loading={loadingLocations}
          locations={toLocations}
          inputValue={toLocationInputState}
          onInputChange={(_, input) => setToLocationInputState(input)}
        />
        <ControlledDateInput
          name={'earliestDate'}
          open={dateOpen}
          onOpen={() => setDateOpen(true)}
          onClose={() => setDateOpen(false)}
        />
      </Box>
      <Box>
        <ControlledCheckBox label={'Show direct lines only'} name={'directLines'} />
      </Box>
    </Box>
  );
};

export default LandTransportSearchBar;
