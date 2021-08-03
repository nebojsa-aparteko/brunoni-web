import React, { useState } from 'react';
import { Box, Checkbox, createStyles, FormControlLabel, makeStyles } from '@material-ui/core';
import DateInput from '../inputs/DateInput';
import TransportModeInput from '../inputs/TransportModeInput';
import LandLocationInput from '../inputs/LandLocationInput';

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
  const [isChecked, setIsChecked] = useState<boolean>(true);

  return (
    <Box className={classes.root}>
      <Box className={classes.body}>
        <LandLocationInput label={'from'} onChange={port => console.log(port)} />
        <LandLocationInput label={'to'} onChange={port => console.log(port)} />
        <DateInput
          fullWidth={true}
          onChange={date => console.log(date)}
          open={dateOpen}
          onOpen={() => setDateOpen(true)}
          onClose={() => setDateOpen(false)}
        />
        <TransportModeInput onChange={mode => console.log(mode)} />
      </Box>
      <Box>
        <FormControlLabel
          control={
            <Checkbox checked={isChecked} onChange={event => setIsChecked(event.target.checked)} color="primary" />
          }
          label="Show direct lines only"
        />
      </Box>
    </Box>
  );
};

export default LandTransportSearchBar;
