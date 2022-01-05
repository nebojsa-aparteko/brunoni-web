import React, { useMemo, useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Dialog,
  DialogContent,
  Divider,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Grid,
  IconButton,
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
  Toolbar,
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
import useAPI from '../../hooks/useAPI';
import useLandTransportProvider from '../../hooks/useLandTransportProvider';
import useModal from '../../hooks/useModal';
import useLandTransportExtensions from '../../hooks/useLandTransportExtensions';
import CloseIcon from '@material-ui/icons/Close';
import EditableTable from '../EditableTable';
import { Currency } from '../../model/Payment';
import { capitalCase } from 'change-case';
import theme from '../../theme';

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
  borderCell: {
    borderLeft: `1px solid ${theme.palette.divider}`,
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
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
  appBar: {
    position: 'relative',
  },
  dialogContent: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: theme.spacing(3),
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

const Connector = ({ provider: providerId }: { provider: string }) => {
  const provider = useLandTransportProvider(providerId);
  return (
    <Box
      display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
      width={'100%'}
      alignSelf={'flexStart'}
      pb={2.5}
    >
      <Typography> {provider.name || 'Hamburg Süd'}</Typography>
      <StepConnector style={{ width: '100%' }} />
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
    properties: { transportMode, provider },
  },
}) => {
  const classes = useStyles();

  return (
    <Box flexGrow={1}>
      <Stepper connector={<Connector provider={provider} />}>
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
          {groupedByContainerType[key].length > 0 && <Details grouped={groupedByContainerType[key]} />}
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
            <TableCell className={classes.borderCell}>Cost Unit</TableCell>
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
                <TableCell component="th" scope="row" className={classes.borderCell}>
                  {`per ${containerType}`}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <DetailsActionButtons grouped={grouped} />
    </Box>
  );
};

const DetailsActionButtons: React.FC<DetailsProps> = ({ grouped }) => {
  const classes = useStyles();
  const { post } = useAPI();
  const { openModal, closeModal, isOpen } = useModal();
  return (
    <Box display="flex" alignItems="center" justifyContent="flex-end" className={classes.buttons}>
      <Button color="primary" variant="outlined" size="small" onClick={openModal}>
        View more
      </Button>
      <BookNowButton bookNow={() => post('landTransport/bookNow', grouped)} />
      {isOpen && (
        <DetailedRoute
          providerId={grouped?.[0].props.provider?.[0]}
          routeId={grouped?.[0].props.route?.[0]}
          isOpen={isOpen}
          closeModal={closeModal}
        />
      )}
    </Box>
  );
};

const DetailedRoute = ({
  providerId,
  routeId,
  isOpen,
  closeModal,
}: {
  isOpen: boolean;
  closeModal: () => void;
  providerId: string;
  routeId: string;
}) => {
  const classes = useStyles();

  const group = useLandTransportExtensions(providerId, routeId, 'DEFAULT');
  return (
    <Dialog open={isOpen} onClose={closeModal} maxWidth="lg" fullWidth>
      <AppBar className={classes.appBar}>
        <Toolbar>
          <Box width={'100%'} display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <Typography variant={'h3'} color={'inherit'}>
                {`Included and Add ons table`}
              </Typography>
            </Box>
            <IconButton onClick={closeModal} color="inherit">
              <CloseIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <DialogContent>
        <Box p={2} display="flex" flexDirection="column" style={{ gap: theme.spacing(2) }}>
          <EditableTable
            viewOnly
            tableTitle="Included items"
            actionLabel="Add included item"
            data={group?.included}
            cells={[
              {
                label: 'Included',
                fieldType: 'autocomplete',
                options: [],
                fieldName: 'extension',
                autocompleteProps: {
                  getOptionLabel: option => option.name,
                  getOptionSelected: (option, value) => option.id === value.id,
                  groupBy: option => option.providerName,
                },
                renderValue: value => value.name,
              },
            ]}
            //@ts-ignore
            defaultItem={{ id: '' }}
            addItem={item => Promise.resolve()}
            editItem={(id, item) => Promise.resolve()}
            deleteItem={id => Promise.resolve()}
          />
          <Divider />
          <EditableTable
            viewOnly
            tableTitle="Add-on items"
            actionLabel="Add add-on"
            data={group?.addOn}
            cells={[
              {
                label: 'Add-on',
                fieldType: 'autocomplete',
                options: [],
                fieldName: 'extension',
                autocompleteProps: {
                  getOptionLabel: option => option.name,
                  getOptionSelected: (option, value) => option.id === value.id,
                  groupBy: option => option.providerName,
                },
                renderValue: value => value.name,
              },
              { label: 'Price', fieldType: 'input', fieldName: 'price.value' },
              {
                label: 'Currency',
                fieldType: 'select',
                fieldName: 'price.currency',
                options: Object.values(Currency).map(value => ({ key: value, label: capitalCase(value) })),
              },
            ]}
            //@ts-ignore
            defaultItem={{ id: '' }}
            addItem={item => Promise.resolve()}
            editItem={(id, item) => Promise.resolve()}
            deleteItem={id => Promise.resolve()}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LandTransportFare;
