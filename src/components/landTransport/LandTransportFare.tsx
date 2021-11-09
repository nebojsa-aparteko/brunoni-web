import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Grid,
  makeStyles,
  Paper,
  Step,
  StepConnector,
  StepLabel,
  Stepper,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Theme,
  Tooltip,
  Typography,
} from '@material-ui/core';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { Alert, AlertTitle } from '@material-ui/lab';
import { R, SegmentsEntity } from './LandTransportSearch';
import { ReactComponent as EcologyIconSVG } from '../../assets/ecology.svg';
import { TransportModeLabels, TransportModeType } from '../../model/land-transport/TransportMode';
import { groupBy } from 'lodash';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import BookNowButton from '../BookNowButton';

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
  tableRow: {
    '& td, th': {
      whiteSpace: 'nowrap',
    },
    '& td': {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
    '&:nth-of-type(even)': {
      backgroundColor: theme.palette.background.default,
    },
  },
  buttons: {
    margin: theme.spacing(1),
    '& > * + *': {
      marginLeft: theme.spacing(1),
    },
  },
}));

const LandTransportFare: React.FC<DetailsProps> = ({ grouped }) => {
  const classes = useStyles();

  return (
    <Paper className={classes.paperRoot}>
      <Box className={classes.container}>
        {/*<FareHeader />*/}
        <FareBody {...grouped[0].result[0]} />
        <Divider />
        <FareFooter grouped={grouped} />
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
    properties: { transportMode },
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
    </Box>
  );
};

const CO2 = (type: TransportModeType) => {
  switch (type) {
    case TransportModeType.TRUCK:
      return '65g CO2/TON-KM';
    case TransportModeType.BARGE:
      return '31.5g CO2/TON-KM';
    case TransportModeType.RAIL:
      return '22g CO2/TON-KM';
    case TransportModeType.BARGE_ROAD:
      return '50g CO2/TON-KM';
    case TransportModeType.BARGE_RAIL:
      return '27g CO2/TON-KM';
    default:
      return false;
  }
};

const FareFooter: React.FC<DetailsProps> = ({ grouped }) => {
  const classes = useStyles();
  const [showDetails, setShowDetails] = useState(false);
  const transportMode = grouped[0].props.transportMode[0];
  const co2 = useMemo(() => CO2(transportMode), [transportMode]);

  return (
    <Box display={'flex'} flexDirection={'column'}>
      <Box className={classes.footer}>
        <Box display="flex" flexDirection="row" justifyContent="space-around" my={1}>
          <Tooltip title={co2}>
            <Box>
              <SvgIcon component={EcologyIconSVG} viewBox="0 0 512 512" />
            </Box>
          </Tooltip>
        </Box>
        <Typography variant={'h4'}>{TransportModeLabels[transportMode]}</Typography>
        <Button
          style={{ margin: '.5em' }}
          color="primary"
          variant="contained"
          onClick={() => setShowDetails(prev => !prev)}
        >
          {showDetails ? 'Hide details' : 'Show details'}
        </Button>
      </Box>
      {showDetails && <GroupedBySize grouped={grouped} />}
    </Box>
  );
};

const GroupedBySize: React.FC<DetailsProps> = ({ grouped }) => {
  const groupedByContainerSize = useMemo(() => Object.entries(groupBy(grouped, 'props.equSize[0]')), [grouped]);
  return (
    <>
      {groupedByContainerSize.map(([key, groupedFare]) => (
        <ExpansionPanel key={key} defaultExpanded={true} TransitionProps={{ mountOnEnter: true }}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h5">{key}</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <GroupedByType grouped={groupedFare} />
          </ExpansionPanelDetails>
        </ExpansionPanel>
      ))}
    </>
  );
};

const GroupedByType: React.FC<DetailsProps> = ({ grouped }) => {
  const groupedByContainerType = groupBy(grouped, 'props.equGroup[0]');
  const groupedByTypeKeys = Object.keys(groupedByContainerType);

  return (
    <Grid container spacing={2} direction="row">
      {groupedByTypeKeys.map(key => (
        <Grid item key={key} md={6}>
          <Details grouped={groupedByContainerType[key]} />
        </Grid>
      ))}
    </Grid>
  );
};

const SizeType = (size: string, type: string) => {
  switch (`${type} ${size}`) {
    case "GENERAL PURPOSE 20'":
      return "20'DC";
    case "GENERAL PURPOSE 40'":
      return "40'DC/HC";
    case "REEFER 20'":
      return "20'RF";
    case "REEFER 40'":
      return "40'RH";
    case "SPECIAL 20'":
      return "20'OT";
    case "SPECIAL 40'":
      return "40'OT/OH";
    default:
      return undefined;
  }
};

interface DetailsProps {
  grouped: R[];
}

const Details: React.FC<DetailsProps> = ({ grouped }) => {
  const classes = useStyles();
  return (
    <Box component={Paper} display={'flex'} flexDirection={'column'}>
      <Table size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>Weight Range</TableCell>
            <TableCell>Currency</TableCell>
            <TableCell>Cost Value</TableCell>
            <TableCell>Container type</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {grouped.map(({ result }, i) => {
            const segment = result[0];
            const { properties } = segment.relationship;
            if (!properties.weightRangeMin || !properties.weightRangeMax) return null;
            const containerType = SizeType(properties.equSize, properties.equGroup);
            return (
              <TableRow key={i} className={classes.tableRow}>
                <TableCell component="th" scope="row">
                  {`${properties.weightRangeMin} - ${
                    properties.weightRangeMax === '99' ? 'MAX' : properties.weightRangeMax
                  }`}
                </TableCell>
                <TableCell component="th" scope="row">
                  {properties.curr}
                </TableCell>
                <TableCell component="th" scope="row">
                  {properties.rate}
                </TableCell>
                <TableCell component="th" scope="row">
                  {`per ${containerType}`}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <DetailsActionButtons />
    </Box>
  );
};

const DetailsActionButtons: React.FC = () => {
  const classes = useStyles();
  return (
    <Box display="flex" alignItems="center" justifyContent="flex-end" className={classes.buttons}>
      <Button color="primary" variant="outlined" size="small" onClick={() => console.log('more')}>
        View more
      </Button>
      <BookNowButton bookNow={() => console.log('booked')} />
    </Box>
  );
};

export default LandTransportFare;
