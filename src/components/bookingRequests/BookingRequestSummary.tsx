import {
  Box,
  Button,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  PaperProps,
  Table,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from '@material-ui/core';
import React, { Fragment, useCallback, useContext } from 'react';
import useUserByAlphacomId from '../../hooks/useUserByAlphacomId';
import TableBody from '@material-ui/core/TableBody';
import { BookingRequest, BookingRequestItinerary, BookingRequestLabels } from '../../model/BookingRequest';
import { ClientDetails } from '../bookings/BookingSummary';
import { formatDateString } from '../routeSearch/Route';
import SchedulePicker from './SchedulePicker';
import {
  ItineraryItem,
  RouteSearchResult,
  RouteSearchResultDestinationInfo,
  RouteSearchResultIntermediatePortInfo,
  RouteSearchResultVoyageInfo,
  SearchResultsPort,
} from '../../model/route-search/RouteSearchResults';
import { useBookingRequestContext } from '../../providers/BookingRequestProvider';
import { Link } from 'react-router-dom';
import UserRecord, { isDashboardUser, UserRecordMin } from '../../model/UserRecord';
import ClientInput from '../inputs/ClientInput';
import useClients from '../../hooks/useClients';
import { compact, get, merge, omit, set, flow } from 'lodash/fp';
import getWithFallback from 'lodash/get';
import AddIcon from '@material-ui/icons/Add';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import palette from '../../theme/palette';
import Ports from '../../contexts/Ports';
import Port from '../../model/Port';
import PortInput from '../inputs/PortInput';
import { CarrierId } from '../../model/Booking';
import VesselAllocationButton from '../VesselAllocationButton';
import { getVoyageInfo } from './BookingRequestView';
import EditingInput from '../EditingInput';
import useUser from '../../hooks/useUser';
import useModal from '../../hooks/useModal';
import { generateCommission, isAgencyCommission } from './BookingRequestFreightDetails';
import isString from '../../utilities/isString';
import theme from '../../theme';
import { getItineraryFromSchedule } from '../onlineBooking/Summary';

const useStyles = makeStyles(theme => ({
  summaryWrapper: {
    display: 'flex',
    flexDirection: 'row',
  },
  firstColumn: {
    paddingTop: 0,
    verticalAlign: 'top',
  },
  secondColumn: {
    paddingTop: 0,
    verticalAlign: 'top',
  },
  tableCellLabel: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: 0,
    border: 'none',
    fontWeight: 700,
    verticalAlign: 'top',
    maxWidth: '8em',
  },
  tableRow: {
    ['@media not print']: {
      [theme.breakpoints.down('sm')]: {
        display: 'block',
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        '& td': {
          display: 'block',
          padding: theme.spacing(0),
        },
      },
    },
    ['@media print']: {
      '& td': {
        padding: theme.spacing(0),
      },
    },
  },
  tableCell: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    verticalAlign: 'top',
    border: 'none',
  },
  summaryTable: {
    width: '100%',
  },
  tableCellQuoteUserData: {
    ['@media not print']: {
      display: 'none',
    },
  },
  statusContainer: {
    backgroundColor: 'rgb(43,132,215)',
    paddingLeft: '5px',
    paddingRight: '5px',
    width: 'fit-content',
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
  },
  blNumberInput: {
    margin: 0,
  },
  paper: {
    marginBottom: theme.spacing(1),
    '&:hover': {
      backgroundColor: palette.background.hover,
    },
  },
  actionSection: {
    backgroundColor: theme.palette.grey['50'],
  },
}));

const emptySearchResultPort = {
  ID: '',
  Land: '',
  HarbourName: '',
  PortName: '',
  PortAgent: '',
  PortAgentID: '',
  TerminalID: '',
} as SearchResultsPort;

const emptyPlaceOfReceipt = {
  Port: emptySearchResultPort,
  DepartureDate: '',
  VoyageInfo: {
    VesselName: '',
    VoyageNr: '',
    Carrier: '',
  },
} as ItineraryItem;

const emptyPlaceOfDelivery = {
  ID: '',
  Port: emptySearchResultPort,
  DepartureDate: undefined,
  VoyageInfo: {
    VesselName: '',
    VoyageNr: '',
    Carrier: '',
  } as RouteSearchResultVoyageInfo,
  ArrivalDate: '',
} as RouteSearchResultDestinationInfo;

const getInputValueFromPort = (value: SearchResultsPort | null) => {
  return value ? ({ id: value.ID, city: value.HarbourName, country: value.Land } as Port) : undefined;
};
const getPortFromInputValue = (value: Port | null) => {
  return value
    ? value.city || value.country
      ? {
          ID: value?.id,
          HarbourName: value?.city || value.id || '',
          PortAgent: '',
          PortName: value?.id,
          Land: value.country || '',
        }
      : ({ ID: value?.id, HarbourName: value?.id, PortAgent: '', PortName: value?.id, Land: '' } as SearchResultsPort)
    : undefined;
};

const intermediateVessels = ['TRUCK', 'BARGE', 'RAIL', 'FEEDER', 'RAIL/TRUCK', 'BARGE/TRUCK', ''];
export const isVesselIntermediate = (vessel: string) => {
  return intermediateVessels.includes(vessel);
};

export const hasPlaceOfReceipt = (schedule: RouteSearchResult | undefined) =>
  schedule?.IntermediatePortInfos.length === 2 ||
  (schedule?.IntermediatePortInfos.length === 1 &&
    (isVesselIntermediate(schedule?.OriginInfo.VoyageInfo.VesselName) || !hasPlaceOfDelivery(schedule))); //Place of delivery has a priority

const hasPlaceOfDelivery = (schedule: RouteSearchResult | undefined) =>
  schedule?.IntermediatePortInfos.length === 2 ||
  (schedule?.IntermediatePortInfos.length === 1 &&
    isVesselIntermediate(schedule?.DestinationInfo?.VoyageInfo?.VesselName));

export const getPortOfLoadingFromIntermediatePorts = (
  schedule: RouteSearchResult | undefined,
): [RouteSearchResultIntermediatePortInfo | undefined, number] => {
  return schedule?.IntermediatePortInfos.length === 2
    ? schedule?.IntermediatePortInfos[0].DepartureDate > schedule?.IntermediatePortInfos[1].DepartureDate
      ? [schedule?.IntermediatePortInfos[1], 1]
      : [schedule?.IntermediatePortInfos[0], 0]
    : schedule?.IntermediatePortInfos.length === 1
    ? [schedule?.IntermediatePortInfos[0], 0]
    : [undefined, -1]; //This should never happen
};

type RelevantDate = keyof Pick<ItineraryItem, 'ArrivalDate' | 'DepartureDate'>;

const PortPresentation: React.FC<{
  port: ItineraryItem;
  relevantDate: RelevantDate;
}> = ({ port, relevantDate }) => (
  <Box display="flex" flexDirection="column">
    {port.Port.HarbourName}
    {relevantDate === 'ArrivalDate' && port.ArrivalDate && (
      <Typography>{`ETA: ${formatDateString(port.ArrivalDate)}`}</Typography>
    )}
    {relevantDate === 'DepartureDate' && port.DepartureDate && (
      <Typography>{`ETS: ${formatDateString(port.DepartureDate)}`}</Typography>
    )}
  </Box>
);

const OptionalPaper: React.FC<{ showPaper: boolean } & PaperProps> = ({ showPaper, children, ...rest }) =>
  showPaper ? <Paper {...rest}>{children}</Paper> : <>{children}</>;

const EditingItineraryInput: React.FC<{
  editing: boolean;
  itinerary: ItineraryItem;
  dateLabel: string;
  relevantDate: RelevantDate;
  handleChangeDate: (value: any) => void;
  handleChangePort?: (value: any) => void;
  handleDelete?: () => void;
  ports?: Port[];
  canEditPort?: boolean;
  canEditDate?: boolean;
  canDelete?: boolean;
}> = ({
  editing,
  itinerary,
  handleChangePort,
  relevantDate,
  handleChangeDate,
  dateLabel,
  ports,
  canEditPort = true,
  canEditDate = false,
  canDelete = false,
  handleDelete,
}) =>
  editing ? (
    <OptionalPaper
      showPaper={canDelete}
      style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: theme.spacing(1) }}
    >
      <Box display="flex" flexDirection="column">
        {canEditPort ? (
          <PortInput
            label={''}
            value={getInputValueFromPort(itinerary.Port)}
            ports={ports || []}
            margin={'dense'}
            onChange={value => handleChangePort?.(value)}
            freeSolo
          />
        ) : (
          <Typography>{itinerary.Port?.HarbourName}</Typography>
        )}
        {canEditDate && (
          <TextField
            label={dateLabel}
            value={getWithFallback(itinerary, relevantDate, '')}
            onChange={event => handleChangeDate(event.target.value)}
            variant="outlined"
            margin="dense"
          />
        )}
      </Box>
      {canDelete && (
        <Box py={2} px={1} display="flex" alignContent="center" alignItems="center" style={{ backgroundColor: '#eee' }}>
          <IconButton onClick={handleDelete} aria-label="delete" size="small">
            <DeleteForeverIcon />
          </IconButton>
        </Box>
      )}
    </OptionalPaper>
  ) : (
    <PortPresentation port={itinerary} relevantDate={relevantDate} />
  );

const ItineraryInfo: React.FC = () => {
  const ports = useContext(Ports);
  const [, userRecord] = useUser();
  const [bookingRequest, setBookingRequest, editing] = useBookingRequestContext();

  const handleChangeItinerary = useCallback(
    (itineraryField: keyof BookingRequestItinerary, value: any, fieldName?: keyof ItineraryItem) => {
      setBookingRequest(prevState => {
        const itinerary = {
          ...prevState.itinerary,
          [itineraryField]: fieldName
            ? {
                ...get(itineraryField)(prevState.itinerary),
                [fieldName]: value,
              }
            : value,
        };
        return set('itinerary', itinerary)(prevState);
      });
    },
    [],
  );

  const handleDeleteItem = useCallback((field: keyof BookingRequestItinerary) => {
    setBookingRequest(prevState => set('itinerary', omit([field])(get('itinerary')(prevState)))(prevState));
  }, []);
  return (
    <React.Fragment>
      {bookingRequest.itinerary?.placeOfReceipt ? (
        <TableRowData
          label="Place of Receipt"
          content={
            <EditingItineraryInput
              itinerary={bookingRequest.itinerary?.placeOfReceipt}
              editing={editing}
              canEditDate={isDashboardUser(userRecord)}
              ports={ports}
              handleChangeDate={value => handleChangeItinerary('placeOfReceipt', value, 'DepartureDate')}
              handleChangePort={value => {
                handleChangeItinerary('placeOfReceipt', getPortFromInputValue(value), 'Port');
              }}
              relevantDate="DepartureDate"
              dateLabel="ETS"
              canEditPort
              canDelete
              handleDelete={() => handleDeleteItem('placeOfReceipt')}
            />
          }
        />
      ) : (
        editing && (
          <TableRowData
            label=""
            content={
              <Button
                size="small"
                color="primary"
                variant="outlined"
                onClick={() => {
                  handleChangeItinerary('placeOfReceipt', emptyPlaceOfReceipt);
                }}
              >
                <AddIcon />
                Add Place of Receipt
              </Button>
            }
          />
        )
      )}
      {bookingRequest.itinerary?.portOfLoading && (
        <TableRowData
          label="Port of Loading"
          content={
            <EditingItineraryInput
              itinerary={bookingRequest.itinerary?.portOfLoading}
              editing={editing}
              canEditDate={isDashboardUser(userRecord)}
              ports={ports}
              handleChangeDate={value => handleChangeItinerary('portOfLoading', value, 'DepartureDate')}
              relevantDate="DepartureDate"
              dateLabel="ETS"
              canEditPort={false}
            />
          }
        />
      )}
      {bookingRequest.itinerary?.portOfDischarge && (
        <TableRowData
          label="Port of Discharge"
          content={
            <EditingItineraryInput
              itinerary={bookingRequest.itinerary?.portOfDischarge}
              editing={editing}
              canEditDate={isDashboardUser(userRecord)}
              ports={ports}
              handleChangeDate={value => handleChangeItinerary('portOfDischarge', value, 'ArrivalDate')}
              relevantDate="ArrivalDate"
              dateLabel="ETA"
              canEditPort={false}
            />
          }
        />
      )}
      {bookingRequest.itinerary?.finalDestinationPort ? (
        <TableRowData
          label="Place of Delivery"
          content={
            <EditingItineraryInput
              itinerary={bookingRequest.itinerary?.finalDestinationPort}
              editing={editing}
              canEditDate={isDashboardUser(userRecord)}
              ports={ports}
              handleChangeDate={value => handleChangeItinerary('finalDestinationPort', value, 'ArrivalDate')}
              handleChangePort={value =>
                handleChangeItinerary('finalDestinationPort', getPortFromInputValue(value), 'Port')
              }
              relevantDate="ArrivalDate"
              dateLabel="ETA"
              canEditPort
              canDelete
              handleDelete={() => handleDeleteItem('finalDestinationPort')}
            />
          }
        />
      ) : (
        editing && (
          <TableRowData
            label=""
            content={
              <Button
                size="small"
                color="primary"
                variant="outlined"
                onClick={() => {
                  handleChangeItinerary('finalDestinationPort', emptyPlaceOfDelivery);
                }}
              >
                <AddIcon />
                Add Place of Delivery
              </Button>
            }
          />
        )
      )}
    </React.Fragment>
  );
};

interface TableRowProps {
  label: string;
  content: React.ReactElement | string;
  className?: any;
}

export const TableRowData: React.FC<TableRowProps> = ({ label, content }) => {
  const classes = useStyles();

  return (
    <TableRow className={classes.tableRow}>
      <TableCell className={classes.tableCellLabel}>{label}</TableCell>
      {isString(content) ? (
        <TableCell className={classes.tableCell} dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <TableCell className={classes.tableCell}>{content}</TableCell>
      )}
    </TableRow>
  );
};

export const userRepresentation = (user: UserRecordMin | undefined | null) => {
  return (
    <React.Fragment>
      {user && user.alphacomId ? (
        <a href={`mailto:${user.emailAddress}`} target="_blank" rel="noopener noreferrer">
          {user.firstName} {user.lastName}
        </a>
      ) : (
        <Typography>Unassigned</Typography>
      )}
    </React.Fragment>
  );
};

const ClientInfo = (bookingRequest: BookingRequest, forwarder?: UserRecord) => {
  if (!bookingRequest?.client) {
    return `${(bookingRequest && bookingRequest.createdBy?.firstName) || ''}`;
  }

  return (
    <Fragment>
      {bookingRequest.client.name}, {bookingRequest.client.city}
      <ClientDetails forwarder={forwarder} bkgRef={bookingRequest?.customerReference} />
    </Fragment>
  );
};

const getHSGIntBLFromBL = (blNo: string) => {
  return blNo.slice(6, 8) + blNo.slice(9, -1);
};

const getHSGRefValueFromBL = (blNo: string) => {
  return blNo.slice(5, -1);
};

const BookingRequestSummary: React.FC<Props> = ({ editing }) => {
  const classes = useStyles();
  const [bookingRequest, setBookingRequest] = useBookingRequestContext();
  const forwarder = useUserByAlphacomId(bookingRequest ? bookingRequest.createdBy?.alphacomId : undefined);
  const { closeModal, isOpen, openModal } = useModal();
  const clients = useClients();
  const [, userRecord] = useUser();

  const handleChangeSchedule = useCallback(
    (schedule: RouteSearchResult | undefined) => {
      const voyageInfo = getVoyageInfo(schedule);
      const commission = generateCommission(
        bookingRequest?.schedule,
        bookingRequest?.freightDetails,
        bookingRequest.carrier?.id,
        bookingRequest.containers,
      );

      setBookingRequest(prevState =>
        merge(prevState!, {
          schedule: schedule,
          itinerary: getItineraryFromSchedule(schedule),
          vessel: voyageInfo?.VesselName,
          voyage: voyageInfo?.VoyageNr,
          freightDetails: compact([
            ...(bookingRequest?.freightDetails?.filter(value => !isAgencyCommission(value)) || []),
            commission,
          ]),
        }),
      );
      closeModal();
    },
    [closeModal, bookingRequest],
  );

  const handleChangeBRField = useCallback((field: keyof BookingRequest, value?: string) => {
    setBookingRequest(prevState => set(field, value)(prevState!));
  }, []);

  const handleChangesAfterBLChange = useCallback(
    (value?: string) => {
      if (bookingRequest.carrier?.id && bookingRequest.carrier.id === CarrierId.HSG && value && value.length === 16) {
        const intBL = getHSGIntBLFromBL(value);
        const refValue = getHSGRefValueFromBL(value);
        setBookingRequest(prevState =>
          flow(
            set('intBlNumber', prevState.intBlNumber ? prevState.intBlNumber : intBL),
            set(
              'containers',
              prevState.containers
                ? prevState.containers.map(container =>
                    flow(
                      set('pickupReference', container.pickupReference ? container.pickupReference : refValue),
                      set('deliveryReference', container.deliveryReference ? container.deliveryReference : refValue),
                      set('vgmPin', container.vgmPin ? container.vgmPin : refValue),
                    )(container),
                  )
                : undefined,
            ),
          )(prevState!),
        );
      }
    },
    [bookingRequest],
  );

  return bookingRequest ? (
    <Box flexDirection="column">
      {editing && (
        <Button color={'primary'} variant="contained" onClick={openModal}>
          Change Schedule
        </Button>
      )}
      <Grid container spacing={1} style={{ paddingTop: '0px', margin: '4px' }}>
        {isOpen && (
          <SchedulePicker
            isOpen={isOpen}
            handleClose={closeModal}
            origin={bookingRequest.origin}
            destination={bookingRequest.destination}
            handleBookNow={handleChangeSchedule}
            carrier={bookingRequest.carrier}
          />
        )}
        <Grid item md={5} xs={12} className={classes.firstColumn}>
          <Table size="small" aria-label="a dense table" className={classes.summaryTable}>
            <TableBody>
              <TableRowData
                label={BookingRequestLabels.carrier}
                content={bookingRequest?.carrier?.name?.toUpperCase() || ''}
              />
              {bookingRequest?.schedule && (
                <TableRowData
                  label={BookingRequestLabels.vessel}
                  content={
                    <Box>
                      {[
                        bookingRequest.itinerary?.portOfLoading.VoyageInfo.VesselName,
                        bookingRequest.itinerary?.portOfLoading.VoyageInfo.VoyageNr,
                      ].join(' VOY. ')}
                      {isDashboardUser(userRecord) && (
                        <VesselAllocationButton vesselVoyage={getVoyageInfo(bookingRequest.schedule)} />
                      )}
                    </Box>
                  }
                />
              )}

              <ItineraryInfo />
            </TableBody>
          </Table>
        </Grid>
        <Grid item md={7} xs={12} className={classes.secondColumn}>
          <Table size="small" aria-label="a dense table" className={classes.summaryTable}>
            <TableBody>
              <TableRow>
                <TableCell className={classes.tableCellLabel}>Status</TableCell>
                <TableCell className={classes.tableCell}>
                  <Paper elevation={0} className={classes.statusContainer}>
                    <Typography className={classes.statusText}>{bookingRequest.statusText}</Typography>
                  </Paper>
                </TableCell>
              </TableRow>
              {bookingRequest.bookingId && (
                <TableRow>
                  <TableCell className={classes.tableCellLabel}>Booking</TableCell>
                  <TableCell className={classes.tableCell}>
                    <Link to={`/bookings/${bookingRequest.bookingId}`} target="_blank">
                      {bookingRequest.bookingId}
                    </Link>
                  </TableCell>
                </TableRow>
              )}
              <TableRowData
                label={BookingRequestLabels.blNumber}
                content={
                  <EditingInput
                    canEdit={isDashboardUser(userRecord)}
                    editing={editing}
                    value={bookingRequest.blNumber}
                    inputProps={{
                      onChange: event => handleChangeBRField('blNumber', event.target.value),
                      onBlur: event => handleChangesAfterBLChange(event.target.value),
                      className: classes.blNumberInput,
                    }}
                  />
                }
              />
              {bookingRequest.intraRefNumber && (
                <TableRowData
                  label={BookingRequestLabels.intraRefNumber}
                  content={
                    <EditingInput
                      canEdit={isDashboardUser(userRecord)}
                      editing={editing}
                      value={bookingRequest.intraRefNumber}
                      inputProps={{
                        onChange: event => handleChangeBRField('intraRefNumber', event.target.value),
                        className: classes.blNumberInput,
                      }}
                    />
                  }
                />
              )}
              {bookingRequest?.carrier?.id === CarrierId.HSG && (
                <TableRowData
                  label={BookingRequestLabels.intBlNumber}
                  content={
                    <EditingInput
                      canEdit={isDashboardUser(userRecord)}
                      editing={editing}
                      value={bookingRequest.intBlNumber}
                      inputProps={{
                        onChange: event => handleChangeBRField('intBlNumber', event.target.value),
                        className: classes.blNumberInput,
                      }}
                    />
                  }
                />
              )}
              <TableRowData
                label={BookingRequestLabels.customerReference}
                content={
                  <EditingInput
                    editing={editing}
                    value={bookingRequest.customerReference}
                    inputProps={{
                      onChange: event => handleChangeBRField('customerReference', event.target.value),
                      className: classes.blNumberInput,
                    }}
                  />
                }
              />
              {bookingRequest.quoteNumber && (
                <TableRowData
                  label={'Quote Reference'}
                  content={
                    <Link to={`/quotes/${bookingRequest.quoteNumber}`} target="_blank">
                      {bookingRequest.quoteNumber}
                    </Link>
                  }
                />
              )}
              <TableRow>
                <TableCell className={classes.tableCellLabel}>Booking Agent</TableCell>
                <TableCell className={classes.tableCell}>{userRepresentation(bookingRequest?.assignedUser)}</TableCell>
              </TableRow>
              {clients && (
                <>
                  <TableRowData
                    label={BookingRequestLabels.client}
                    content={
                      editing ? (
                        <ClientInput
                          label=""
                          clients={clients}
                          onChange={client =>
                            setBookingRequest(prevState => prevState && set('client', client)(prevState))
                          }
                          value={bookingRequest.client}
                          margin="dense"
                        />
                      ) : (
                        <span>{ClientInfo(bookingRequest, forwarder)}</span>
                      )
                    }
                  />
                  <TableRowData
                    label={BookingRequestLabels.statClient}
                    content={
                      editing ? (
                        <ClientInput
                          label=""
                          clients={clients}
                          onChange={client =>
                            setBookingRequest(prevState => prevState && set('statClient', client)(prevState))
                          }
                          value={bookingRequest.statClient}
                          margin="dense"
                        />
                      ) : (
                        <Typography>
                          {bookingRequest.statClient
                            ? bookingRequest.statClient.name + ', ' + bookingRequest.statClient.city
                            : 'Unassigned'}
                        </Typography>
                      )
                    }
                  />
                </>
              )}
            </TableBody>
          </Table>
        </Grid>
      </Grid>
    </Box>
  ) : null;
};

interface Props {
  editing: boolean;
}

export default BookingRequestSummary;
