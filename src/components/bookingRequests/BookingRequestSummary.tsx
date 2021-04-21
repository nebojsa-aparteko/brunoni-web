import {
  Box,
  Button,
  Grid,
  makeStyles,
  Paper,
  Table,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from '@material-ui/core';
import React, { Dispatch, Fragment, SetStateAction, useMemo, useState } from 'react';
import { useClientById } from '../../hooks/useClient';
import useUserByAlphacomId from '../../hooks/useUserByAlphacomId';
import TableBody from '@material-ui/core/TableBody';
import { BookingRequest } from '../../model/BookingRequest';
import { ClientDetails } from '../bookings/BookingSummary';
import { isIntermediary } from '../ItineraryItem';
import { formatDateString } from '../routeSearch/Route';
import SchedulePicker from './SchedulePicker';
import { RouteSearchResult, RouteSearchResultOriginInfo } from '../../model/route-search/RouteSearchResults';
import { useBookingRequestContext } from '../../providers/BookingRequestProvider';

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
}));

interface IntermediateInfosProps {
  bookingRequest: BookingRequest;
  setBookingRequest: Dispatch<SetStateAction<BookingRequest | undefined>> | undefined;
  editing?: boolean;
}

const IntermediateInfos: React.FC<IntermediateInfosProps> = ({ bookingRequest, setBookingRequest, editing }) => {
  const [isOriginIntermediary] = useState<boolean | undefined>(
    bookingRequest.schedule?.OriginInfo ? !!isIntermediary(bookingRequest.schedule?.OriginInfo) : undefined,
  );

  const handleChangeDepartureDate = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    index: number,
  ) => {
    const newIntermediatePortInfos = bookingRequest.schedule?.IntermediatePortInfos.map((info, infoIndex) =>
      index === infoIndex ? { ...info, DepartureDate: event.target.value } : info,
    );
    setBookingRequest &&
      setBookingRequest({
        ...bookingRequest,
        schedule: {
          ...bookingRequest.schedule,
          IntermediatePortInfos: newIntermediatePortInfos,
        } as RouteSearchResult,
      });
  };

  return (
    <React.Fragment>
      {bookingRequest.schedule?.IntermediatePortInfos.length === 1 ? (
        <TableRowData
          label={isOriginIntermediary ? 'Port of Loading' : 'Port of Discharge'}
          content={
            editing ? (
              <Box display="flex" flexDirection="column">
                {bookingRequest.schedule?.IntermediatePortInfos[0].Port.HarbourName}
                <TextField
                  label={isOriginIntermediary ? 'ETS' : 'ETA'}
                  value={bookingRequest.schedule?.IntermediatePortInfos[0].DepartureDate}
                  onChange={event => handleChangeDepartureDate(event, 0)}
                  variant="outlined"
                  margin="dense"
                />
              </Box>
            ) : (
              [
                bookingRequest.schedule?.IntermediatePortInfos[0].Port.HarbourName,
                formatDateString(bookingRequest.schedule?.IntermediatePortInfos[0].DepartureDate),
              ].join(isOriginIntermediary ? '<br/>ETS: ' : '<br/>ETA: ')
            )
          }
        />
      ) : (
        bookingRequest.schedule?.IntermediatePortInfos.map((info, index) => (
          <TableRowData
            label={index === 0 ? 'Port of Loading' : 'Port of Discharge'}
            content={
              editing ? (
                <Box display="flex" flexDirection="column">
                  {info.Port.HarbourName}
                  <TextField
                    label={index === 0 ? 'ETS' : 'ETA'}
                    value={info.DepartureDate}
                    onChange={event => handleChangeDepartureDate(event, index)}
                    variant="outlined"
                    margin="dense"
                  />
                </Box>
              ) : (
                [info.Port.HarbourName, formatDateString(info.DepartureDate)].join(
                  index === 0 ? '<br/>ETS: ' : '<br/>ETA: ',
                )
              )
            }
          />
        ))
      )}
    </React.Fragment>
  );
};

const isVesselIntermediate = (vessel: string) => {
  return ['TRUCK', 'BARGE', 'RAIL', 'FEEDER', 'RAIL/TRUCK', 'BARGE/TRUCK'].includes(vessel);
};

interface ItineraryInfoProps {
  bookingRequest: BookingRequest;
  setBookingRequest: Dispatch<SetStateAction<BookingRequest | undefined>> | undefined;
  editing?: boolean;
}

const ItineraryInfo: React.FC<ItineraryInfoProps> = ({ bookingRequest, setBookingRequest, editing }) => {
  const handleChangeDepartureDate = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setBookingRequest &&
      setBookingRequest({
        ...bookingRequest,
        schedule: {
          ...bookingRequest.schedule,
          OriginInfo: {
            ...bookingRequest.schedule?.OriginInfo,
            DepartureDate: event.target.value,
          } as RouteSearchResultOriginInfo,
        } as RouteSearchResult,
      });
  };
  const handleChangeArrivalDate = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setBookingRequest &&
      setBookingRequest({
        ...bookingRequest,
        schedule: {
          ...bookingRequest.schedule,
          DestinationInfo: {
            ...bookingRequest.schedule?.DestinationInfo,
            ArrivalDate: event.target.value,
          } as RouteSearchResultOriginInfo,
        } as RouteSearchResult,
      });
  };

  return (
    <React.Fragment>
      {bookingRequest.schedule?.OriginInfo && (
        <TableRowData
          label={
            isVesselIntermediate(bookingRequest.schedule?.OriginInfo.VoyageInfo.VesselName)
              ? 'Place of Receipt'
              : 'Port of Loading'
          }
          content={
            editing ? (
              <Box display="flex" flexDirection="column">
                {bookingRequest.schedule?.OriginInfo.Port.HarbourName}
                <TextField
                  label={'ETS'}
                  value={bookingRequest.schedule?.OriginInfo.DepartureDate}
                  onChange={handleChangeDepartureDate}
                  variant="outlined"
                  margin="dense"
                />
              </Box>
            ) : (
              [
                bookingRequest.schedule?.OriginInfo.Port.HarbourName,
                formatDateString(bookingRequest.schedule?.OriginInfo.DepartureDate),
              ].join('<br/>ETS: ')
            )
          }
        />
      )}

      {bookingRequest.schedule?.IntermediatePortInfos && bookingRequest.schedule?.IntermediatePortInfos.length > 0 && (
        <IntermediateInfos bookingRequest={bookingRequest} setBookingRequest={setBookingRequest} editing={editing} />
      )}

      {bookingRequest.schedule?.DestinationInfo && (
        <TableRowData
          label={
            isVesselIntermediate(bookingRequest.schedule?.DestinationInfo.VoyageInfo.VesselName)
              ? 'Place of Delivery'
              : 'Port of Discharge'
          }
          content={
            editing ? (
              <Box display="flex" flexDirection="column">
                {bookingRequest.schedule?.OriginInfo.Port.HarbourName}
                <TextField
                  label={'ETA'}
                  value={bookingRequest.schedule?.DestinationInfo.ArrivalDate}
                  onChange={handleChangeArrivalDate}
                  variant="outlined"
                  margin="dense"
                />
              </Box>
            ) : (
              [
                bookingRequest.schedule?.DestinationInfo.Port.HarbourName,
                formatDateString(bookingRequest.schedule?.DestinationInfo.ArrivalDate),
              ].join('<br/>ETA: ')
            )
          }
        />
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

const BookingRequestSummary: React.FC<Props> = ({ editing }) => {
  const classes = useStyles();
  const [bookingRequest, setBookingRequest] = useBookingRequestContext();
  const client = useClientById(bookingRequest ? bookingRequest.createdBy.alphacomClientId : undefined);
  const forwarder = useUserByAlphacomId(bookingRequest ? bookingRequest.createdBy.alphacomId : undefined);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };

  const clientInfo = useMemo(() => {
    if (!client) {
      return `${(bookingRequest && bookingRequest.createdBy.firstName) || ''}`;
    }

    return (
      <Fragment>
        {client.name}, {client.city}
        <ClientDetails forwarder={forwarder} />
      </Fragment>
    );
  }, [client, bookingRequest]);

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

  console.log(bookingRequest.assignedUser, 'Assigned user ');

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
                  bookingRequest?.carrier && bookingRequest?.carrier?.id
                    ? bookingRequest?.carrier?.id?.toUpperCase()
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
              <col style={{ width: '16.6%' }} />
              <col style={{ width: '83.4%' }} />
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
                  editing ? (
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
              {bookingRequest.quoteNumber && (
                <TableRowData label={'Quote Reference'} content={bookingRequest.quoteNumber + ''} />
              )}
              <TableRow>
                <TableCell className={classes.tableCellLabel}>Booking Agent</TableCell>
                <TableCell className={classes.tableCell}>
                  {bookingRequest?.assignedUser && bookingRequest.assignedUser.alphacomId ? (
                    <a
                      href={`mailto:${bookingRequest?.assignedUser?.emailAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {bookingRequest?.assignedUser.firstName} {bookingRequest?.assignedUser.lastName}
                    </a>
                  ) : (
                    <Typography>Unassigned</Typography>
                  )}
                </TableCell>
              </TableRow>
              <TableRow className={classes.tableRow}>
                <TableCell className={classes.tableCellLabel}>Client</TableCell>
                <TableCell className={classes.tableCell}>{clientInfo}</TableCell>
              </TableRow>
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
