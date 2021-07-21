import React from 'react';
import {
  Box,
  Button,
  Divider,
  makeStyles,
  Paper,
  Step,
  StepConnector,
  StepLabel,
  Stepper,
  Theme,
  Typography,
} from '@material-ui/core';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { Alert, AlertTitle } from '@material-ui/lab';

const useStyles = makeStyles((theme: Theme) => ({
  paperRoot: {
    padding: theme.spacing(1),
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  body: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
}));

const LandTransportFare: React.FC = () => {
  const classes = useStyles();

  return (
    <Paper className={classes.paperRoot}>
      <Box className={classes.container}>
        <Box display={'flex'} justifyContent={'flex-end'}>
          <Box>
            <Alert icon={false} color={'success'}>
              <AlertTitle>{'CHEAPEST'}</AlertTitle>
            </Alert>
          </Box>
        </Box>
        <Box className={classes.body}>
          {/* body */}
          <Box flexGrow={1}>
            <Stepper alternativeLabel connector={<StepConnector />}>
              <Step>
                <StepLabel StepIconComponent={FiberManualRecordIcon}>
                  <Box className={classes.container}>
                    <Typography variant={'h4'}>{'13:45'}</Typography>
                    <Typography>{'14-04-21'}</Typography>
                    <Typography variant={'h5'}>{'NL RTM'}</Typography>
                  </Box>
                </StepLabel>
              </Step>
              <Step>
                <StepLabel StepIconComponent={FiberManualRecordIcon}>
                  <Box className={classes.container}>
                    <Typography variant={'h4'}>{'16:20'}</Typography>
                    <Typography>{'18-04-21'}</Typography>
                    <Typography variant={'h5'}>{'BEANR'}</Typography>
                  </Box>
                </StepLabel>
              </Step>
            </Stepper>
          </Box>
        </Box>
        <Divider />
        <Box className={classes.footer}>
          <Box className={classes.body}>
            <Typography variant={'h4'} style={{ paddingRight: '1em' }}>
              Est. price
            </Typography>
            <Typography variant={'h5'}>{2932.0}</Typography>
          </Box>
          <Typography variant={'h4'}>Contargo</Typography>
          <Button style={{ margin: '.5em' }} color="primary" variant="contained" onClick={() => console.log('clicked')}>
            Book now
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default LandTransportFare;
