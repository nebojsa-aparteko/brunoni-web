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
import { RouteSearchResult } from '../../model/land-transport/RouteSearchResult';

const useStyles = makeStyles((theme: Theme) => ({
  paperRoot: {
    padding: theme.spacing(2),
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  firstLabel: {
    display: 'flex',
    flexDirection: 'row-reverse',
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));

const LandTransportFare: React.FC<RouteSearchResult> = props => {
  const classes = useStyles();

  return (
    <Paper className={classes.paperRoot}>
      <Box className={classes.container}>
        <FareHeader />
        <FareBody {...props} />
        <Divider />
        <FareFooter {...props} />
      </Box>
    </Paper>
  );
};

const FareHeader: React.FC = () => {
  return (
    <Box display={'flex'} justifyContent={'flex-end'}>
      <Box>
        <Alert icon={null} color={'success'}>
          <AlertTitle>{'CHEAPEST'}</AlertTitle>
        </Alert>
      </Box>
    </Box>
  );
};

const FareBody: React.FC<RouteSearchResult> = ({ toLocationName }) => {
  const classes = useStyles();

  return (
    <Box flexGrow={1}>
      <Stepper connector={<StepConnector />}>
        <Step>
          <StepLabel className={classes.firstLabel} icon={<FiberManualRecordIcon />}>
            <Box className={classes.container}>
              <Typography variant={'h4'}>{'13:45'}</Typography>
              <Typography>{'14-04-21'}</Typography>
              <Typography variant={'h5'}>{'NL RTM'}</Typography>
            </Box>
          </StepLabel>
        </Step>
        <Step>
          <StepLabel icon={<FiberManualRecordIcon />}>
            <Box className={classes.container}>
              <Typography variant={'h4'}>{'16:20'}</Typography>
              <Typography>{'18-04-21'}</Typography>
              <Typography variant={'h5'}>{'BEANR'}</Typography>
            </Box>
          </StepLabel>
        </Step>
      </Stepper>
    </Box>
  );
};

const FareFooter: React.FC<RouteSearchResult> = ({ rate }) => {
  const classes = useStyles();

  return (
    <Box className={classes.footer}>
      <Box className={classes.footer} style={{ paddingRight: '.5em' }}>
        <Typography variant={'h4'} style={{ paddingRight: '.5em' }}>
          Est. price
        </Typography>
        <Typography variant={'h4'}>{rate}€</Typography>
      </Box>
      <Typography variant={'h4'}>Contargo</Typography>
      <Button style={{ margin: '.5em' }} color="primary" variant="contained" onClick={() => console.log('clicked')}>
        Book now
      </Button>
    </Box>
  );
};

export default LandTransportFare;
