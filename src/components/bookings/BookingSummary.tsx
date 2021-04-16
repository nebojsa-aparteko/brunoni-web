import React, { Fragment, useMemo } from 'react';
import { Grid, makeStyles, Paper, Table, TableCell, TableRow, Typography } from '@material-ui/core';
import TableBody from '@material-ui/core/TableBody';
import { Booking } from '../../model/Booking';
import useUserByAlphacomId from '../../hooks/useUserByAlphacomId';
import { DateFormats, formatDateSafe } from '../../utilities/formattingHelpers';
import UserRecord from '../../model/UserRecord';
import { useClientById } from '../../hooks/useClient';

interface Props {
  booking: Booking;
  bookingAgent: UserRecord | null | undefined;
}

const mediaNotPrint = '@media not print';
const mediaPrint = '@media print';
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
    [mediaNotPrint]: {
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
    [mediaPrint]: {
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
    [mediaNotPrint]: {
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

export const ClientDetails: React.FC<{
  forwarder: UserRecord | null | undefined;
  forwarderText: string | null;
  bkgRef: string;
}> = ({ forwarder, bkgRef, forwarderText }) => {
  const forwarderEmail = forwarder ? forwarder?.emailAddress : null;
  const forwarderFullName = forwarder ? `${forwarder?.firstName} ${forwarder?.lastName}` : null;
  return (
    <Typography variant="body2">
      {forwarder ? (
        <span>
          {forwarder?.emailAddress ? (
            <a href={'mailto:' + forwarderEmail}>{forwarderFullName || forwarderEmail?.toUpperCase()}</a>
          ) : (
            forwarderFullName || ' '
          )}
        </span>
      ) : (
        <span>{forwarderText}</span>
      )}
      ({'REF. ' + bkgRef})
    </Typography>
  );
};

const TableRowData: React.FC<TableRowProps> = ({ label, content }) => {
  const classes = useStyles();

  return (
    <TableRow className={classes.tableRow}>
      <TableCell className={classes.tableCellLabel}>{label}</TableCell>
      <TableCell className={classes.tableCell} dangerouslySetInnerHTML={{ __html: content }} />
    </TableRow>
  );
};
const BookingSummary: React.FC<Props> = ({ booking, bookingAgent }) => {
  const classes = useStyles();
  const client = useClientById(booking.ForwAdrId);
  const forwarder = useUserByAlphacomId(booking.ForwPersID);
  const clientInfo = useMemo(() => {
    console.log(forwarder);
    if (!client) {
      return `${booking.ForwAdrName || ''} ${booking.ForwAdrCity} (${booking.ForwAdrId})`;
    }

    return (
      <Fragment>
        {client.name}, {client.city}
        <ClientDetails forwarder={forwarder} forwarderText={booking.ForwarderPersTxt} bkgRef={booking['Cust-BkgRef']} />
      </Fragment>
    );
  }, [client, booking, forwarder]);

  return (
    <Grid container spacing={1} style={{ paddingTop: '0px', margin: '4px' }}>
      <Grid item md={5} xs={12} className={classes.firstColumn}>
        <Table size="small" aria-label="a dense table" className={classes.summaryTable}>
          <colgroup>
            <col style={{ width: '16.6%' }} />
            <col style={{ width: '83.4%' }} />
          </colgroup>
          <TableBody>
            <TableRowData label={'Carrier'} content={booking?.CarrierID?.toUpperCase() || ''} />

            <TableRowData label={'Vessel'} content={[booking.Vessel, booking.Voyage].join(' VOY. ')} />

            {booking.POLName !== booking.PlaceOfRecieptName ? (
              <TableRowData
                label={'Place of Receipt'}
                content={[
                  booking.PlaceOfRecieptName,
                  booking.PlaceOfReceiptETS
                    ? formatDateSafe(booking.PlaceOfReceiptETS, DateFormats.LONG)
                    : formatDateSafe(booking.ETS, DateFormats.LONG),
                ].join('<br/>ETS: ')}
              />
            ) : null}

            <TableRowData
              label={'Port of Loading'}
              content={[booking.POLName, formatDateSafe(booking.ETS, DateFormats.LONG)].join('<br/>ETS: ')}
            />
            <TableRowData
              label={'Port of Discharge'}
              content={[booking.PODName, formatDateSafe(booking.ETA, DateFormats.LONG)].join('<br/>ETA: ')}
            />

            {booking.PODName !== booking.FinalDestinationName ? (
              <TableRowData
                label={'Place of Delivery'}
                content={[
                  booking.FinalDestinationName,
                  formatDateSafe(
                    booking.FinalDestinationETA ? booking.FinalDestinationETA : booking.ETA,
                    DateFormats.LONG,
                  ),
                ].join('<br/>ETA: ')}
              />
            ) : null}
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
                  <Typography className={classes.statusText}>{booking.BkgStatusText}</Typography>
                </Paper>
              </TableCell>
            </TableRow>
            <TableRowData label={'B/L-NO'} content={booking['BL-No']} />
            <TableRow>
              <TableCell className={classes.tableCellLabel}>Booking Agent</TableCell>
              <TableCell className={classes.tableCell}>
                <a
                  href={`mailto:${bookingAgent?.emailAddress || booking?.BkgAgentContactEml}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {bookingAgent ? `${bookingAgent.firstName} ${bookingAgent.lastName}` : booking.BkgAgentContactTxt}
                </a>
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
  );
};

export default BookingSummary;
