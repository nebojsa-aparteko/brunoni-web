import {
  Box,
  Button,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Table,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from '@material-ui/core';
import React, { Dispatch, Fragment, SetStateAction, useCallback, useContext, useEffect, useState } from 'react';
import useUserByAlphacomId from '../../hooks/useUserByAlphacomId';
import TableBody from '@material-ui/core/TableBody';
import { BookingRequest, BookingRequestLabels } from '../../model/BookingRequest';
import { ClientDetails } from '../bookings/BookingSummary';
import { formatDateString } from '../routeSearch/Route';
import SchedulePicker from './SchedulePicker';
import {
  ItineraryItem,
  RouteSearchResult,
  RouteSearchResultDestinationInfo,
  RouteSearchResultIntermediatePortInfo,
  RouteSearchResultOriginInfo,
  RouteSearchResultVoyageInfo,
  SearchResultsPort,
} from '../../model/route-search/RouteSearchResults';
import { useBookingRequestContext } from '../../providers/BookingRequestProvider';
import { Link } from 'react-router-dom';
import UserRecord, { isDashboardUser, UserRecordMin } from '../../model/UserRecord';
import ClientInput from '../inputs/ClientInput';
import useClients from '../../hooks/useClients';
import { cloneDeep, compact, get, merge, set } from 'lodash/fp';
import UserRecordContext from '../../contexts/UserRecordContext';
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
import { generateCommission } from './BookingRequestFreightDetails';

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
interface Itinerary {
  placeOfReceipt: ItineraryItem | undefined;
  portOfLoading?: ItineraryItem;
  portOfDischarge?: ItineraryItem;
  placeOfDelivery: ItineraryItem | undefined;
}
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
  ID: '',
  Port: emptySearchResultPort,
  DepartureDate: '',
  VoyageInfo: {
    VesselName: '',
    VoyageNr: '',
    Carrier: '',
  } as RouteSearchResultVoyageInfo,
  ArrivalDate: undefined,
} as RouteSearchResultOriginInfo;

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
const isVesselIntermediate = (vessel: string) => {
  return intermediateVessels.includes(vessel);
};

export const hasPlaceOfReceipt = (schedule: RouteSearchResult | undefined) =>
  schedule?.IntermediatePortInfos.length === 2 ||
  (schedule?.IntermediatePortInfos.length === 1 &&
    (isVesselIntermediate(schedule?.OriginInfo.VoyageInfo.VesselName) || !hasPlaceOfDelivery(schedule))); //Place of delivery has a priority

const hasPlaceOfDelivery = (schedule: RouteSearchResult | undefined) =>
  schedule?.IntermediatePortInfos.length === 2 ||
  (schedule?.IntermediatePortInfos.length === 1 &&
    isVesselIntermediate(schedule?.DestinationInfo.VoyageInfo.VesselName));

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

const getPortOfDischargeFromIntermediatePorts = (schedule: RouteSearchResult | undefined) => {
  return schedule?.IntermediatePortInfos.length === 2
    ? schedule?.IntermediatePortInfos[0].DepartureDate > schedule?.IntermediatePortInfos[1].DepartureDate
      ? [schedule?.IntermediatePortInfos[0], 0]
      : [schedule?.IntermediatePortInfos[1], 1]
    : schedule?.IntermediatePortInfos.length === 1
    ? [schedule?.IntermediatePortInfos[0], 0]
    : [undefined, -1]; //This should never happen
};

const getFieldToUpdate = (newItinerary: Itinerary, itineraryItemName: string) => {
  switch (itineraryItemName) {
    case 'placeOfReceipt':
      return 'OriginInfo';
    case 'placeOfDelivery':
      return 'DestinationInfo';
    case 'portOfLoading':
      return newItinerary.placeOfReceipt ? 'IntermediatePortInfos' : 'OriginInfo';
    case 'portOfDischarge':
      return newItinerary.placeOfDelivery ? 'IntermediatePortInfos' : 'DestinationInfo';
  }
};

interface ItineraryInfoProps {
  bookingRequest: BookingRequest;
  setBookingRequest: Dispatch<SetStateAction<BookingRequest | undefined>> | undefined;
  editing?: boolean;
}

export const getItineraryFromSchedule = (schedule?: RouteSearchResult) => {
  if (!schedule) return undefined;
  const isPlaceOfReceiptDefined = hasPlaceOfReceipt(schedule);
  const isPlaceOfDeliveryDefined = hasPlaceOfDelivery(schedule);
  const [POL] = getPortOfLoadingFromIntermediatePorts(schedule) as [RouteSearchResultIntermediatePortInfo, number];
  const [POD] = getPortOfDischargeFromIntermediatePorts(schedule) as [RouteSearchResultIntermediatePortInfo, number];

  return {
    placeOfReceipt: isPlaceOfReceiptDefined ? (schedule?.OriginInfo as ItineraryItem) : undefined,
    portOfLoading: (isPlaceOfReceiptDefined ? POL : schedule?.OriginInfo) as ItineraryItem,
    portOfDischarge: (isPlaceOfDeliveryDefined ? POD : schedule?.DestinationInfo) as ItineraryItem,
    placeOfDelivery: isPlaceOfDeliveryDefined ? (schedule?.DestinationInfo as ItineraryItem) : undefined,
  } as Itinerary;
};
const ItineraryInfo: React.FC<ItineraryInfoProps> = ({ bookingRequest, setBookingRequest, editing }) => {
  const classes = useStyles();
  const ports = useContext(Ports);
  const userRecord = useContext(UserRecordContext);
  const [itinerary, setItinerary] = useState(getItineraryFromSchedule(bookingRequest.schedule));

  useEffect(() => {
    setItinerary(getItineraryFromSchedule(bookingRequest.schedule));
  }, [bookingRequest.schedule]);

  const handleChangeItinerary = (itineraryItemName: string, fieldName: string, value: any) => {
    if (!itinerary) return;
    const newItinerary = set(itineraryItemName, set(fieldName, value)(get(itineraryItemName)(itinerary)))(itinerary);
    const itineraryItemToUpdate: string | undefined = getFieldToUpdate(newItinerary, itineraryItemName);
    const schedule = { ...bookingRequest.schedule };
    itineraryItemToUpdate &&
      setBookingRequest &&
      setBookingRequest(
        set('schedule', set(itineraryItemToUpdate, get(itineraryItemName)(newItinerary))(schedule))(bookingRequest),
      );
  };
  //TODO this will have some issues e.g.
  // We should remove Origin, Intermediate and Destination Port Infos from Schedule and use Itinerary instead to avoid further issues with remapping
  const handleAddPlaceOfReceipt = () => {
    if (!itinerary) return;
    const newItinerary = set('placeOfReceipt', emptyPlaceOfReceipt)(itinerary);
    const schedule = {
      ...bookingRequest.schedule,
      OriginInfo: newItinerary.placeOfReceipt,
      IntermediatePortInfos: [...(bookingRequest.schedule?.IntermediatePortInfos || []), newItinerary.portOfLoading],
    } as RouteSearchResult;
    setBookingRequest && setBookingRequest(set('schedule', schedule)(bookingRequest));
  };
  const handleAddPlaceOfDelivery = () => {
    if (!itinerary) return;
    const newItinerary = set('placeOfDelivery', emptyPlaceOfDelivery)(itinerary);
    const schedule = {
      ...bookingRequest.schedule,
      DestinationInfo: newItinerary.placeOfReceipt,
      IntermediatePortInfos: [...(bookingRequest.schedule?.IntermediatePortInfos || []), newItinerary.portOfDischarge],
    } as RouteSearchResult;
    setBookingRequest && setBookingRequest(set('schedule', schedule)(bookingRequest));
  };
  const handleDeleteItineraryItem = (fieldName: string) => {
    const [port, index] =
      fieldName === 'placeOfReceipt'
        ? (getPortOfLoadingFromIntermediatePorts(bookingRequest.schedule) as [
            RouteSearchResultIntermediatePortInfo,
            number,
          ])
        : (getPortOfDischargeFromIntermediatePorts(bookingRequest.schedule) as [
            RouteSearchResultIntermediatePortInfo,
            number,
          ]);
    const tempSchedule = cloneDeep(bookingRequest.schedule);
    const schedule = tempSchedule
      ? ((fieldName === 'placeOfReceipt'
          ? {
              ...tempSchedule,
              OriginInfo: port || undefined,
              IntermediatePortInfos: tempSchedule?.IntermediatePortInfos
                ? tempSchedule?.IntermediatePortInfos.filter((_, i) => i !== index)
                : undefined,
            }
          : {
              ...tempSchedule,
              DestinationInfo: tempSchedule?.IntermediatePortInfos ? port : undefined,
              IntermediatePortInfos: tempSchedule?.IntermediatePortInfos
                ? tempSchedule?.IntermediatePortInfos.filter((_, i) => i !== index)
                : undefined,
            }) as RouteSearchResult)
      : undefined;
    setBookingRequest && setBookingRequest(set('schedule', schedule)(bookingRequest));
  };

  return (
    <React.Fragment>
      {itinerary && itinerary.placeOfReceipt ? (
        <TableRowData
          label={'Place of Receipt'}
          content={
            editing && isDashboardUser(userRecord) ? (
              <Paper className={classes.paper}>
                <Box display="flex">
                  <Box display="flex" flexDirection="column" flex="1" p={1}>
                    {/*{itinerary.placeOfReceipt?.Port.HarbourName}*/}
                    <PortInput
                      label={''}
                      value={getInputValueFromPort(itinerary.placeOfReceipt?.Port)}
                      ports={ports || []}
                      margin={'dense'}
                      onChange={value => handleChangeItinerary('placeOfReceipt', 'Port', getPortFromInputValue(value))}
                      freeSolo
                    />
                    <TextField
                      label={'ETS'}
                      value={itinerary.placeOfReceipt?.DepartureDate}
                      onChange={event => handleChangeItinerary('placeOfReceipt', 'DepartureDate', event.target.value)}
                      variant="outlined"
                      margin="dense"
                    />
                  </Box>
                  <Box
                    py={2}
                    px={1}
                    display="flex"
                    alignContent="center"
                    alignItems="center"
                    className={classes.actionSection}
                  >
                    <IconButton
                      onClick={() => handleDeleteItineraryItem('placeOfReceipt')}
                      aria-label="delete"
                      size="small"
                    >
                      <DeleteForeverIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            ) : (
              <React.Fragment>
                {itinerary.placeOfReceipt?.Port.HarbourName}
                {itinerary.placeOfReceipt?.DepartureDate && (
                  <>
                    <br />
                    {`ETS: ${formatDateString(itinerary.placeOfReceipt?.DepartureDate)}`}
                  </>
                )}
              </React.Fragment>
            )
          }
        />
      ) : (
        editing &&
        bookingRequest?.schedule &&
        isDashboardUser(userRecord) && (
          <TableRow className={classes.tableRow}>
            <TableCell colSpan={2} className={classes.tableCell}>
              <Button
                color="primary"
                aria-label="Add place of receipt"
                size="small"
                onClick={handleAddPlaceOfReceipt}
                fullWidth
                style={{ flex: 1 }}
              >
                <AddIcon />
                Add Place of Receipt
              </Button>
            </TableCell>
          </TableRow>
        )
      )}

      {itinerary && itinerary.portOfLoading && (
        <TableRowData
          label={'Port Of Loading'}
          content={
            editing && isDashboardUser(userRecord) ? (
              <Box display="flex" flexDirection="column">
                {itinerary.portOfLoading?.Port.HarbourName}
                <TextField
                  label={'ETS'}
                  value={itinerary.portOfLoading?.DepartureDate}
                  onChange={event => handleChangeItinerary('portOfLoading', 'DepartureDate', event.target.value)}
                  variant="outlined"
                  margin="dense"
                />
              </Box>
            ) : (
              <React.Fragment>
                {itinerary.portOfLoading?.Port.HarbourName}
                {itinerary.portOfLoading?.DepartureDate && (
                  <>
                    <br />
                    {`ETS: ${formatDateString(itinerary.portOfLoading?.DepartureDate)}`}
                  </>
                )}
              </React.Fragment>
            )
          }
        />
      )}

      {itinerary && itinerary.portOfDischarge && (
        <TableRowData
          label={'Port of Discharge'}
          content={
            editing && isDashboardUser(userRecord) ? (
              <Box display="flex" flexDirection="column">
                {itinerary.portOfDischarge?.Port.HarbourName}
                <TextField
                  label={'ETA'}
                  value={itinerary.portOfDischarge?.ArrivalDate}
                  onChange={event => handleChangeItinerary('portOfDischarge', 'ArrivalDate', event.target.value)}
                  variant="outlined"
                  margin="dense"
                />
              </Box>
            ) : (
              <React.Fragment>
                {itinerary.portOfDischarge?.Port.HarbourName}
                {itinerary.portOfDischarge?.ArrivalDate && (
                  <>
                    <br />
                    {`ETA: ${formatDateString(itinerary.portOfDischarge?.ArrivalDate)}`}
                  </>
                )}
              </React.Fragment>
            )
          }
        />
      )}

      {itinerary && itinerary.placeOfDelivery ? (
        <TableRowData
          label={'Place of Delivery'}
          content={
            editing && isDashboardUser(userRecord) ? (
              <Paper className={classes.paper}>
                <Box display="flex">
                  <Box display="flex" flexDirection="column" flex="1" p={1}>
                    <PortInput
                      label={''}
                      value={getInputValueFromPort(itinerary.placeOfDelivery?.Port)}
                      ports={ports || []}
                      margin={'dense'}
                      onChange={value => handleChangeItinerary('placeOfDelivery', 'Port', getPortFromInputValue(value))}
                      freeSolo
                    />
                    <TextField
                      label={'ETA'}
                      value={itinerary.placeOfDelivery?.ArrivalDate}
                      onChange={event => handleChangeItinerary('placeOfDelivery', 'ArrivalDate', event.target.value)}
                      variant="outlined"
                      margin="dense"
                    />
                  </Box>
                  <Box
                    py={2}
                    px={1}
                    display="flex"
                    alignContent="center"
                    alignItems="center"
                    className={classes.actionSection}
                  >
                    <IconButton
                      onClick={() => handleDeleteItineraryItem('placeOfDelivery')}
                      aria-label="delete"
                      size="small"
                    >
                      <DeleteForeverIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            ) : (
              <React.Fragment>
                {itinerary.placeOfDelivery?.Port.HarbourName}
                {itinerary.placeOfDelivery?.ArrivalDate && (
                  <>
                    <br />
                    {`ETA: ${formatDateString(itinerary.placeOfDelivery?.ArrivalDate)}`}
                  </>
                )}
              </React.Fragment>
            )
          }
        />
      ) : (
        editing &&
        bookingRequest?.schedule &&
        isDashboardUser(userRecord) && (
          <TableRow className={classes.tableRow}>
            <TableCell colSpan={2} className={classes.tableCell}>
              <Button
                color="primary"
                aria-label="Add place of receipt"
                size="small"
                onClick={handleAddPlaceOfDelivery}
                fullWidth
                style={{ flex: 1 }}
              >
                <AddIcon />
                Add Place of Delivery
              </Button>
            </TableCell>
          </TableRow>
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
      {typeof content === 'string' ? (
        <TableCell className={classes.tableCell} dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <TableCell className={classes.tableCell}>{content}</TableCell>
      )}
    </TableRow>
  );
};

export const userRepresentation = (user: UserRecordMin | undefined) => {
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
        bookingRequest?.freightDetails?.find(
          (detail: FreightDetail) =>
            detail.Txt === 'Seafreight' || detail.Txt === 'Seefracht' || detail.Txt === 'Fret Maritime',
        ),
        bookingRequest?.freightDetails,
      );

      setBookingRequest(prevState =>
        merge(prevState!, {
          schedule: schedule,
          vessel: voyageInfo?.VesselName,
          voyage: voyageInfo?.VoyageNr,
          freightDetails: compact([...(bookingRequest?.freightDetails || []), commission]),
        }),
      );
      closeModal();
    },
    [closeModal, bookingRequest],
  );

  const handleChangeBRField = useCallback((field: keyof BookingRequest, value?: string) => {
    setBookingRequest(prevState => set(field, value)(prevState!));
  }, []);

  const handleChangeCustomerRef = useCallback((value?: string) => {
    setBookingRequest(prevState => set('customerReference', value)(prevState!));
  }, []);

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
                        bookingRequest.schedule?.OriginInfo.VoyageInfo.VesselName,
                        bookingRequest.schedule?.OriginInfo.VoyageInfo.VoyageNr,
                      ].join(' VOY. ')}
                      {isDashboardUser(userRecord) && (
                        <VesselAllocationButton vesselVoyage={getVoyageInfo(bookingRequest.schedule)} />
                      )}
                    </Box>
                  }
                />
              )}

              <ItineraryInfo bookingRequest={bookingRequest} setBookingRequest={setBookingRequest} editing={editing} />
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
                    <Typography className={classes.statusText}>{bookingRequest.status}</Typography>
                  </Paper>
                </TableCell>
              </TableRow>

              <TableRowData
                label={BookingRequestLabels.blNumber}
                content={
                  <EditingInput
                    editing={editing}
                    value={bookingRequest.blNumber}
                    inputProps={{
                      onChange: event => handleChangeBRField('blNumber', event.target.value),
                      className: classes.blNumberInput,
                    }}
                  />
                }
              />
              {bookingRequest?.carrier?.id === CarrierId.HSG && (
                <TableRowData
                  label={BookingRequestLabels.intBlNumber}
                  content={
                    <EditingInput
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
              {editing && (
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
              )}
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
