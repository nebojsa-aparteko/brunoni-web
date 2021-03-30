import UserRecord from '../../model/UserRecord';
import { Grid, makeStyles, Paper, Table, TableCell, TableRow, Typography } from '@material-ui/core';
import React, { Fragment, useMemo } from 'react';
import { useClientById } from '../../hooks/useClient';
import useUserByAlphacomId from '../../hooks/useUserByAlphacomId';
import TableBody from '@material-ui/core/TableBody';
import { BookingRequest } from '../../model/BookingRequest';
import { ClientDetails } from '../bookings/BookingSummary';

interface Props {
  bookingRequest: BookingRequest;
  bookingAgent: UserRecord | null | undefined;
}

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

interface TableRowProps {
  label: string;
  content: string;
  className?: any;
}

const TableRowData: React.FC<TableRowProps> = ({ label, content }) => {
  const classes = useStyles();

  return (
    <TableRow className={classes.tableRow}>
      <TableCell className={classes.tableCellLabel}>{label}</TableCell>
      <TableCell className={classes.tableCell} dangerouslySetInnerHTML={{ __html: content }} />
    </TableRow>
  );
};
const BookingRequestSummary: React.FC<Props> = ({ bookingRequest, bookingAgent }) => {
  const classes = useStyles();
  const client = useClientById(bookingRequest.createdBy.alphacomClientId);
  const forwarder = useUserByAlphacomId(bookingRequest.createdBy.alphacomId);

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

  return (
    <Grid container spacing={1} style={{ paddingTop: '0px', margin: '4px' }}>
      <Grid item md={5} xs={12} className={classes.firstColumn}>
        <Table size="small" aria-label="a dense table" className={classes.summaryTable}>
          <colgroup>
            <col style={{ width: '16.6%' }} />
            <col style={{ width: '83.4%' }} />
          </colgroup>
          <TableBody>
            <TableRowData label={'Carrier'} content={bookingRequest?.carrier?.id?.toUpperCase() || ''} />

            <TableRowData
              label={'Vessel'}
              content={[
                bookingRequest.schedule?.OriginInfo.VoyageInfo.VesselName,
                bookingRequest.schedule?.OriginInfo.VoyageInfo.VoyageNr,
              ].join(' VOY. ')}
            />
            {/*TODO add rules to determine which of the following exist Place of Receipt, Port of Loading, Port of Discharge and Place of Delivery */}
            {bookingRequest.schedule?.OriginInfo && (
              <TableRowData
                label={'Place of Receipt'}
                content={[
                  bookingRequest.schedule?.OriginInfo.Port.HarbourName,
                  bookingRequest.schedule?.OriginInfo.DepartureDate,
                ].join('<br/>ETS: ')}
              />
            )}

            {bookingRequest.schedule?.IntermediatePortInfos &&
              bookingRequest.schedule?.IntermediatePortInfos.length > 0 && (
                <>
                  <TableRowData
                    label={'Port of Loading'}
                    content={['Port of loading name', 'Port of landing ETS'].join('<br/>ETS: ')}
                  />
                  <TableRowData
                    label={'Port of Discharge'}
                    content={['Port of discharge name', 'Port of discharge ETA'].join('<br/>ETA: ')}
                  />
                </>
              )}

            {bookingRequest.schedule?.DestinationInfo && (
              <TableRowData
                label={'Place of Delivery'}
                content={[
                  bookingRequest.schedule?.DestinationInfo.Port.HarbourName,
                  bookingRequest.schedule?.DestinationInfo.ArrivalDate,
                ].join('<br/>ETA: ')}
              />
            )}
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
            {/*<TableRow>*/}
            {/*  <TableCell className={classes.tableCellLabel}>Booking Agent</TableCell>*/}
            {/*  <TableCell className={classes.tableCell}>*/}
            {/*    <a*/}
            {/*      href={`mailto:${bookingAgent?.emailAddress || bookingRequest?.BkgAgentContactEml}`}*/}
            {/*      target="_blank"*/}
            {/*      rel="noopener noreferrer"*/}
            {/*    >*/}
            {/*      {bookingAgent ? `${bookingAgent.firstName} ${bookingAgent.lastName}` : bookingRequest.BkgAgentContactTxt}*/}
            {/*    </a>*/}
            {/*  </TableCell>*/}
            {/*</TableRow>*/}
            <TableRow className={classes.tableRow}>
              <TableCell className={classes.tableCellLabel}>Client</TableCell>
              <TableCell className={classes.tableCell}>{clientInfo}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Grid>
    </Grid>
  );
};

export default BookingRequestSummary;
