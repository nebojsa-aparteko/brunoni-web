import { Box, Button, Grid, makeStyles, Paper, Table, TableCell, TableRow, Typography } from '@material-ui/core';
import React, { Fragment, useMemo, useState } from 'react';
import { useClientById } from '../../hooks/useClient';
import useUserByAlphacomId from '../../hooks/useUserByAlphacomId';
import TableBody from '@material-ui/core/TableBody';
import { BookingRequest } from '../../model/BookingRequest';
import { ClientDetails } from '../bookings/BookingSummary';
import { isIntermediary } from '../ItineraryItem';
import { formatDateString } from '../routeSearch/Route';
import SchedulePicker from './SchedulePicker';
import { RouteSearchResult } from '../../model/route-search/RouteSearchResults';

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
}));

interface IntermediateInfosProps {
  bookingRequest: BookingRequest;
}

const IntermediateInfos: React.FC<IntermediateInfosProps> = ({ bookingRequest }) => {
  const [isOriginIntermediary] = useState<boolean | undefined>(
    bookingRequest.schedule?.OriginInfo ? !!isIntermediary(bookingRequest.schedule?.OriginInfo) : undefined,
  );

  return (
    <React.Fragment>
      {bookingRequest.schedule?.IntermediatePortInfos.length === 1 ? (
        <TableRowData
          label={isOriginIntermediary ? 'Port of Loading' : 'Port of Discharge'}
          content={[
            bookingRequest.schedule?.IntermediatePortInfos[0].Port.HarbourName,
            formatDateString(bookingRequest.schedule?.IntermediatePortInfos[0].DepartureDate),
          ].join(isOriginIntermediary ? '<br/>ETS: ' : '<br/>ETA: ')}
        />
      ) : (
        bookingRequest.schedule?.IntermediatePortInfos.map((info, index) => (
          <TableRowData
            label={index === 0 ? 'Port of Loading' : 'Port of Discharge'}
            content={[info.Port.HarbourName, formatDateString(info.DepartureDate)].join(
              index === 0 ? '<br/>ETS: ' : '<br/>ETA: ',
            )}
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
}

const ItineraryInfo: React.FC<ItineraryInfoProps> = ({ bookingRequest }) => {
  return (
    <React.Fragment>
      {bookingRequest.schedule?.OriginInfo && (
        <TableRowData
          label={
            isVesselIntermediate(bookingRequest.schedule?.OriginInfo.VoyageInfo.VesselName)
              ? 'Place of Receipt'
              : 'Port of Loading'
          }
          content={[
            bookingRequest.schedule?.OriginInfo.Port.HarbourName,
            formatDateString(bookingRequest.schedule?.OriginInfo.DepartureDate),
          ].join('<br/>ETS: ')}
        />
      )}

      {bookingRequest.schedule?.IntermediatePortInfos && bookingRequest.schedule?.IntermediatePortInfos.length > 0 && (
        <IntermediateInfos bookingRequest={bookingRequest} />
      )}

      {bookingRequest.schedule?.DestinationInfo && (
        <TableRowData
          label={
            isVesselIntermediate(bookingRequest.schedule?.DestinationInfo.VoyageInfo.VesselName)
              ? 'Place of Delivery'
              : 'Port of Discharge'
          }
          content={[
            bookingRequest.schedule?.DestinationInfo.Port.HarbourName,
            formatDateString(bookingRequest.schedule?.DestinationInfo.ArrivalDate),
          ].join('<br/>ETA: ')}
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

const BookingRequestSummary: React.FC<Props> = ({ bookingRequest, setBookingRequest, editing }) => {
  const classes = useStyles();
  const client = useClientById(bookingRequest.createdBy.alphacomClientId);
  const forwarder = useUserByAlphacomId(bookingRequest.createdBy.alphacomId);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };

  const clientInfo = useMemo(() => {
    if (!client) {
      return `${bookingRequest.createdBy.firstName || ''}`;
    }

    return (
      <Fragment>
        {client.name}, {client.city}
        <ClientDetails forwarder={forwarder} />
      </Fragment>
    );
  }, [client, bookingRequest]);

  const handleChangeSchedule = (schedule: RouteSearchResult | undefined) => {
    setBookingRequest({ ...bookingRequest, schedule: schedule });
  };

  return (
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

              <ItineraryInfo bookingRequest={bookingRequest} />
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
              <TableRowData label={'B/L-NO'} content={bookingRequest.blNumber || '[To be assigned]'} />
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
  );
};

interface Props {
  bookingRequest: BookingRequest;
  setBookingRequest: (bookingRequest: BookingRequest) => void;
  editing?: boolean;
}

export default BookingRequestSummary;
