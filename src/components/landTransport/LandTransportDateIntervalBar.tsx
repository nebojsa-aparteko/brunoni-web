import React, { useState } from 'react';
import { Box, Grid, makeStyles, Paper, Theme, Typography } from '@material-ui/core';
import DateInput from '../inputs/DateInput';

const useStyles = makeStyles((theme: Theme) => ({
  paperRoot: {
    padding: theme.spacing(1),
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
  },
}));

const LandTransportDateIntervalBar: React.FC = () => {
  const classes = useStyles();
  const [fromDateOpen, setFromDateOpen] = useState<boolean>(false);
  const [toDateOpen, setToDateOpen] = useState<boolean>(false);

  return (
    <Paper className={classes.paperRoot}>
      <Grid container spacing={2} justify="center">
        <Grid item sm={4} xs={12}>
          <Box className={classes.info}>
            <Typography color={'primary'}>Rotterdam - Antwerp</Typography>
            <Typography>{6} Containers</Typography>
          </Box>
        </Grid>
        <Grid item sm={4} xs={12}>
          <DateInput
            onChange={date => console.log(date)}
            open={fromDateOpen}
            onOpen={() => setFromDateOpen(true)}
            onClose={() => setFromDateOpen(false)}
            label={'from'}
          />
        </Grid>
        <Grid item sm={4} xs={12}>
          <DateInput
            onChange={date => console.log(date)}
            open={toDateOpen}
            onOpen={() => setToDateOpen(true)}
            onClose={() => setToDateOpen(false)}
            label={'to'}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default LandTransportDateIntervalBar;
