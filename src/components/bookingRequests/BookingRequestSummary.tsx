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
import React, { Dispatch, Fragment, SetStateAction, useContext, useEffect, useMemo, useState } from 'react';
import useUserByAlphacomId from '../../hooks/useUserByAlphacomId';
import TableBody from '@material-ui/core/TableBody';
import { BookingRequest } from '../../model/BookingRequest';
import { ClientDetails } from '../bookings/BookingSummary';
import { formatDateString } from '../routeSearch/Route';
import SchedulePicker from './SchedulePicker';
import {
  RouteSearchResult,
  RouteSearchResultDestinationInfo,
  RouteSearchResultOriginInfo,
  RouteSearchResultVoyageInfo,
  SearchResultsPort,
} from '../../model/route-search/RouteSearchResults';
import { useBookingRequestContext } from '../../providers/BookingRequestProvider';
import { Link } from 'react-router-dom';
import { isDashboardUser, UserRecordMin } from '../../model/UserRecord';
import ClientInput from '../inputs/ClientInput';
import useClients from '../../hooks/useClients';
import { set, get, unset } from 'lodash/fp';
import UserRecord from '../../contexts/UserRecordContext';
import UserRecordContext from '../../contexts/UserRecordContext';
import AddIcon from '@material-ui/icons/Add';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import palette from '../../theme/palette';
import Ports from '../../contexts/Ports';
import Port from '../../model/Port';
import PortInput from '../inputs/PortInput';

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

const intermediateVessels = ['TRUCK', 'BARGE', 'RAIL', 'FEEDER', 'RAIL/TRUCK', 'BARGE/TRUCK'];
const isVesselIntermediate = (vessel: string) => {
  return intermediateVessels.includes(vessel);
};

const hasPlaceOfReceipt = (bookingRequest: BookingRequest) => {
  return (
    bookingRequest.schedule?.IntermediatePortInfos.length === 2 ||
    (bookingRequest.schedule?.IntermediatePortInfos.length === 1 &&
      isVesselIntermediate(bookingRequest.schedule?.OriginInfo.VoyageInfo.VesselName))
  );
};

const hasPlaceOfDelivery = (bookingRequest: BookingRequest) => {
  return (
    bookingRequest.schedule?.IntermediatePortInfos.length === 2 ||
    (bookingRequest.schedule?.IntermediatePortInfos.length === 1 &&
      (isVesselIntermediate(bookingRequest.schedule?.DestinationInfo.VoyageInfo.VesselName) ||
        !hasPlaceOfReceipt(bookingRequest)))
  );
};

const getPortOfLoading = (bookingRequest: BookingRequest) => {
  return bookingRequest.schedule?.IntermediatePortInfos.length === 2
    ? bookingRequest.schedule?.IntermediatePortInfos[0].DepartureDate >
      bookingRequest.schedule?.IntermediatePortInfos[1].DepartureDate
      ? bookingRequest.schedule?.IntermediatePortInfos[1]
      : bookingRequest.schedule?.IntermediatePortInfos[0]
    : bookingRequest.schedule?.IntermediatePortInfos.length === 1
    ? bookingRequest.schedule?.IntermediatePortInfos[0]
    : undefined; //This should never happen
};

const getPortOfDischarge = (bookingRequest: BookingRequest) => {
  return bookingRequest.schedule?.IntermediatePortInfos.length === 2
    ? bookingRequest.schedule?.IntermediatePortInfos[0].DepartureDate >
      bookingRequest.schedule?.IntermediatePortInfos[1].DepartureDate
      ? bookingRequest.schedule?.IntermediatePortInfos[0]
      : bookingRequest.schedule?.IntermediatePortInfos[1]
    : bookingRequest.schedule?.IntermediatePortInfos.length === 1
    ? bookingRequest.schedule?.IntermediatePortInfos[0]
    : undefined; //This should never happen
};

// const getFieldToUpdate = (newItinerary, itineraryItemName) => {
//   switch (itineraryItemName) {
//     case 'placeOfReceipt':
//       return 'OriginInfo';
//     case 'placeOfDelivery':
//       return 'DestinationInfo';
//     case 'portOfLoading':
//       return newItinerary.placeOfReceipt ? 'IntermediateInfo' : 'OriginInfo';
//     case 'portOfDischarge':
//       return newItinerary.placeOfDelivery ? 'IntermediateInfo' : "DestinationInfo";
//   };
// };

interface ItineraryInfoProps {
  bookingRequest: BookingRequest;
  setBookingRequest: Dispatch<SetStateAction<BookingRequest | undefined>> | undefined;
  editing?: boolean;
}

const ItineraryInfo: React.FC<ItineraryInfoProps> = ({ bookingRequest, setBookingRequest, editing }) => {
  const classes = useStyles();
  const ports = useContext(Ports);
  const userRecord = useContext(UserRecordContext);
  const [isPlaceOfReceiptDefined, setIsPlaceOfReceiptDefined] = useState(hasPlaceOfReceipt(bookingRequest));
  const [isPlaceOfDeliveryDefined, setIsPlaceOfDeliveryDefined] = useState(hasPlaceOfDelivery(bookingRequest));

  const [itinerary, setItinerary] = useState({
    placeOfReceipt: isPlaceOfReceiptDefined ? bookingRequest.schedule?.OriginInfo : undefined,
    portOfLoading: isPlaceOfReceiptDefined ? getPortOfLoading(bookingRequest) : bookingRequest.schedule?.OriginInfo,
    portOfDischarge: isPlaceOfDeliveryDefined
      ? getPortOfDischarge(bookingRequest)
      : bookingRequest.schedule?.DestinationInfo,
    placeOfDelivery: isPlaceOfDeliveryDefined ? bookingRequest.schedule?.DestinationInfo : undefined,
  });

  useEffect(() => {
    setIsPlaceOfReceiptDefined(hasPlaceOfReceipt(bookingRequest));
    setIsPlaceOfDeliveryDefined(hasPlaceOfDelivery(bookingRequest));
    setItinerary({
      placeOfReceipt: isPlaceOfReceiptDefined ? bookingRequest.schedule?.OriginInfo : undefined,
      portOfLoading: isPlaceOfReceiptDefined ? getPortOfLoading(bookingRequest) : bookingRequest.schedule?.OriginInfo,
      portOfDischarge: isPlaceOfDeliveryDefined
        ? getPortOfDischarge(bookingRequest)
        : bookingRequest.schedule?.DestinationInfo,
      placeOfDelivery: isPlaceOfDeliveryDefined ? bookingRequest.schedule?.DestinationInfo : undefined,
    });
  }, [bookingRequest]);

  console.log(JSON.stringify(itinerary));

  const handleChangeItinerary = (itineraryItemName: string, fieldName: string, value: any) => {
    setItinerary(set(itineraryItemName, set(fieldName, value)(get(itineraryItemName)(itinerary)))(itinerary));
  };

  const handleAddPlaceOfReceipt = () => {
    setItinerary(set('placeOfReceipt', emptyPlaceOfReceipt)(itinerary));
  };
  const handleAddPlaceOfDelivery = () => {
    setItinerary(set('placeOfDelivery', emptyPlaceOfDelivery)(itinerary));
  };

  const handleDeleteItineraryItem = (fieldName: string) => {
    setItinerary(unset(fieldName)(itinerary));
  };

  return (
    <React.Fragment>
      {itinerary.placeOfReceipt ? (
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

      {itinerary.portOfLoading && (
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

      {itinerary.portOfDischarge && (
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

      {itinerary.placeOfDelivery ? (
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

const BookingRequestSummary: React.FC<Props> = ({ editing }) => {
  const classes = useStyles();
  const [bookingRequest, setBookingRequest] = useBookingRequestContext();
  const forwarder = useUserByAlphacomId(bookingRequest ? bookingRequest.createdBy?.alphacomId : undefined);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const clients = useClients();
  const userRecord = useContext(UserRecord);

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };

  const clientInfo = useMemo(() => {
    if (!bookingRequest?.client) {
      return `${(bookingRequest && bookingRequest.createdBy?.firstName) || ''}`;
    }

    return (
      <Fragment>
        {bookingRequest.client.name}, {bookingRequest.client.city}
        <ClientDetails forwarder={forwarder} bkgRef={bookingRequest?.customerReference} />
      </Fragment>
    );
  }, [bookingRequest]);

  const handleChangeSchedule = (schedule: RouteSearchResult | undefined) => {
    bookingRequest &&
      setBookingRequest &&
      setBookingRequest({
        ...bookingRequest,
        schedule: schedule,
      });
    handleDialogClose();
  };

  const handleChangeBLNumber = (value?: string) => {
    bookingRequest && setBookingRequest && setBookingRequest({ ...bookingRequest, blNumber: value });
  };
  const handleChangeCustomerRef = (value?: string) => {
    bookingRequest && setBookingRequest && setBookingRequest({ ...bookingRequest, customerReference: value });
  };

  return bookingRequest ? (
    <Box flexDirection="column">
      {editing && (
        <Button color={'primary'} variant="contained" onClick={handleDialogOpen}>
          Change Schedule
        </Button>
      )}
      <Grid container spacing={1} style={{ paddingTop: '0px', margin: '4px' }}>
        <SchedulePicker
          isOpen={isDialogOpen}
          handleClose={handleDialogClose}
          origin={bookingRequest.origin}
          destination={bookingRequest.destination}
          handleBookNow={handleChangeSchedule}
        />
        <Grid item md={5} xs={12} className={classes.firstColumn}>
          <Table size="small" aria-label="a dense table" className={classes.summaryTable}>
            <colgroup>
              <col style={{ width: '16.6%' }} />
              <col style={{ width: '83.4%' }} />
            </colgroup>
            <TableBody>
              <TableRowData
                label={'Carrier'}
                content={
                  bookingRequest?.carrier && bookingRequest?.carrier?.name
                    ? bookingRequest?.carrier?.name?.toUpperCase()
                    : ''
                }
              />
              <TableRowData
                label={'Vessel'}
                content={[
                  bookingRequest.schedule?.OriginInfo.VoyageInfo.VesselName,
                  bookingRequest.schedule?.OriginInfo.VoyageInfo.VoyageNr,
                ].join(' VOY. ')}
              />

              <ItineraryInfo bookingRequest={bookingRequest} setBookingRequest={setBookingRequest} editing={editing} />
            </TableBody>
          </Table>
        </Grid>
        <Grid item md={7} xs={12} className={classes.secondColumn}>
          <Table size="small" aria-label="a dense table" className={classes.summaryTable}>
            <colgroup>
              <col style={{ width: '30%' }} />
              <col style={{ width: '70%' }} />
            </colgroup>
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
                label={'B/L-NO'}
                content={
                  editing && isDashboardUser(userRecord) ? (
                    <TextField
                      label=""
                      margin="dense"
                      variant="outlined"
                      fullWidth
                      value={bookingRequest.blNumber}
                      onChange={event => handleChangeBLNumber(event.target.value)}
                      className={classes.blNumberInput}
                    />
                  ) : (
                    bookingRequest.blNumber || '[To be assigned]'
                  )
                }
              />
              {bookingRequest.inttraRefNumber && (
                <TableRowData label={'Inttra reference'} content={bookingRequest.inttraRefNumber} />
              )}
              {editing && (
                <TableRowData
                  label={'Customer ref.'}
                  content={
                    <TextField
                      label=""
                      margin="dense"
                      variant="outlined"
                      fullWidth
                      value={bookingRequest.customerReference}
                      onChange={event => handleChangeCustomerRef(event.target.value)}
                      className={classes.blNumberInput}
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
                    label={'Client'}
                    content={
                      editing ? (
                        <ClientInput
                          label=""
                          clients={clients}
                          onChange={client =>
                            setBookingRequest(prevState => prevState && set('client', client)(prevState))
                          }
                          value={bookingRequest.client}
                        />
                      ) : (
                        <span>{clientInfo}</span>
                      )
                    }
                  />
                  <TableRowData
                    label={'Statistic Client'}
                    content={
                      editing ? (
                        <ClientInput
                          label=""
                          clients={clients}
                          onChange={client =>
                            setBookingRequest(prevState => prevState && set('statClient', client)(prevState))
                          }
                          value={bookingRequest.statClient}
                        />
                      ) : (
                        <Typography>
                          {bookingRequest.statClient
                            ? (bookingRequest.statClient.name, bookingRequest.statClient.city)
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
  editing?: boolean;
}

export default BookingRequestSummary;
