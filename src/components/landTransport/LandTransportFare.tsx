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
  SvgIcon,
  Theme,
  Typography,
} from '@material-ui/core';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { Alert, AlertTitle } from '@material-ui/lab';
import { SegmentsEntity } from './LandTransportSearch';
import { ReactComponent as EcologyIconSVG } from '../../assets/ecology.svg';

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

const LandTransportFare: React.FC<SegmentsEntity> = props => {
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
    <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
      <Typography variant={'h4'}>Hamburg Süd</Typography>
      {false && (
        <Box>
          <Alert icon={null} color={'success'}>
            <AlertTitle>{'CHEAPEST'}</AlertTitle>
          </Alert>
        </Box>
      )}
    </Box>
  );
};

const FareBody: React.FC<SegmentsEntity> = ({
  start: {
    properties: { name: startName },
  },
  end: {
    properties: { name: endName },
  },
  relationship: {
    properties: { equSize, weightRangeMin, weightRangeMax, weightUnit, equGroup },
  },
}) => {
  const classes = useStyles();

  return (
    <Box flexGrow={1}>
      <Stepper connector={<StepConnector />}>
        <Step>
          <StepLabel className={classes.firstLabel} icon={<FiberManualRecordIcon />}>
            <Box className={classes.container}>
              <Typography variant={'h5'}>{startName}</Typography>
            </Box>
          </StepLabel>
        </Step>
        <Step>
          <StepLabel icon={<FiberManualRecordIcon />}>
            <Box className={classes.container}>
              <Typography variant={'h5'}>{endName}</Typography>
            </Box>
          </StepLabel>
        </Step>
      </Stepper>
      <Box display="flex" flexDirection="row" justifyContent="space-around" my={1}>
        <Typography variant={'h4'}>
          Equipment size: {equSize} {equGroup}
        </Typography>
        <Typography variant={'h4'}>
          Weight range: {weightRangeMin}-{weightRangeMax} {weightUnit}
        </Typography>
        <Box>
          <SvgIcon component={EcologyIconSVG} viewBox="0 0 512 512" />
        </Box>
      </Box>
    </Box>
  );
};

const FareFooter: React.FC<SegmentsEntity> = ({
  relationship: {
    properties: { rate, transportMode },
  },
}) => {
  const classes = useStyles();

  return (
    <Box className={classes.footer}>
      <Box className={classes.footer} style={{ paddingRight: '.5em' }}>
        <Typography variant={'h4'} style={{ paddingRight: '.5em' }}>
          Est. price
        </Typography>
        <Typography variant={'h4'}>{rate || '1000'}€</Typography>
      </Box>
      <Typography variant={'h4'}>{transportMode}</Typography>
      <Button style={{ margin: '.5em' }} color="primary" variant="contained" onClick={() => console.log('clicked')}>
        Book now
      </Button>
    </Box>
  );
};

export default LandTransportFare;
