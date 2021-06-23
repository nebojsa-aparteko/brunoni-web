import React, { useContext, useState } from 'react';
import { Checkbox, FormControlLabel, Grid, makeStyles, Paper, Theme } from '@material-ui/core';
import PortInput from '../inputs/PortInput';
import DateInput from '../inputs/DateInput';
import TransportModeInput from '../inputs/TransportModeInput';
import Ports from '../../contexts/Ports';

const useStyles = makeStyles((theme: Theme) => ({
  paperRoot: {
    padding: theme.spacing(1),
  },
}));

const LandTransportSearchBar: React.FC = () => {
  const classes = useStyles();
  const ports = useContext(Ports);
  const [dateOpen, setDateOpen] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(true);

  return (
    <Paper className={classes.paperRoot}>
      <Grid container spacing={2} justify="center">
        <Grid item sm={3} xs={12}>
          <PortInput label={'Port of discharge'} ports={ports || []} onChange={port => console.log(port)} />
          <FormControlLabel
            control={
              <Checkbox checked={isChecked} onChange={event => setIsChecked(event.target.checked)} color="primary" />
            }
            label="Show direct lines only"
          />
        </Grid>
        <Grid item sm={3} xs={12}>
          <PortInput label={'Delivery location'} ports={ports || []} onChange={port => console.log(port)} />
        </Grid>
        <Grid item sm={2} xs={12}>
          <DateInput
            onChange={date => console.log(date)}
            open={dateOpen}
            onOpen={() => setDateOpen(true)}
            onClose={() => setDateOpen(false)}
          />
        </Grid>
        <Grid item sm={4} xs={12}>
          <TransportModeInput onChange={mode => console.log(mode)} />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default LandTransportSearchBar;
