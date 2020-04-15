import React, { useMemo, Fragment } from 'react';
import { Table, TableCell, TableRow, makeStyles, Typography } from '@material-ui/core';
import TableBody from '@material-ui/core/TableBody';
import { Booking } from '../../model/Booking';
import useClients from '../../hooks/useClients';
import formatDate from 'date-fns/format';
import useUserByAlphacomId from '../../hooks/useUserByAlphacomId';
import { DateFormats } from '../../utilities/formattingHelpers';

interface Props {
  booking: Booking;
}

const formatDateString = (date: Date) => {
  try {
    return formatDate(date, DateFormats.LONG);
  } catch (err) {
    console.error(`Error formatting passed date ${date} `, err);
    return '???';
  }
};

const useStyles = makeStyles(theme => ({
  tableCellLabel: {
    paddingLeft: 0,
    border: 'none',
    fontWeight: 700,
    verticalAlign: 'top',
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
}));

interface TableRowProps {
  label: string;
  content: string;
  className?: any;
}

export const ClientDetails: React.FC<{
  forwarderName: string | null;
  forwarderID: string | undefined;
  bkgRef: string;
}> = ({ forwarderName, forwarderID, bkgRef }) => {
  const forwarder = useUserByAlphacomId(forwarderID);
  const forwarderEmail = forwarder?.emailAddress;
  const forwarderFullName = `${forwarder?.firstName} ${forwarder?.lastName}`;
  return (
    <Typography variant="body2">
      {forwarder && (
        <span>
          {forwarderEmail ? (
            <a href={'mailto:' + forwarderEmail}>{forwarderFullName.toUpperCase()}</a>
          ) : (
            { forwarderFullName }
          )}{' '}
          &nbsp;
        </span>
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
const clientNameAndLoc = (name: string, location: string) => `${name}, ${location && location}`;
const BookingSummary: React.FC<Props> = ({ booking }) => {
  const classes = useStyles();
  const clients = useClients();

  const client = useMemo(() => clients?.find(client => client.id === booking.ForwAdrId), [clients, booking.ForwAdrId]);

  const clientInfo = useMemo(() => {
    if (!client) {
      return booking.ForwAdrId;
    }

    return (
      <Fragment>
        {clientNameAndLoc(client.name, booking.ForwAdrCity)}
        <ClientDetails
          forwarderName={booking.ForwarderPersTxt}
          forwarderID={
            booking.ForwPersID && booking.ForwAdrId
              ? booking.ForwAdrId + '-' + booking.ForwPersID.padStart(3, '0')
              : undefined
          }
          bkgRef={booking['Cust-BkgRef']}
        />
      </Fragment>
    );
  }, [client, booking]);

  return (
    <Table size="small" aria-label="a dense table" className={classes.summaryTable}>
      <colgroup>
        <col style={{ width: '16.6%' }} />
        <col style={{ width: '83.4%' }} />
      </colgroup>
      <TableBody>
        <TableRowData label={'Vessel'} content={[booking.Vessel, booking.Voyage].join(' VOY. ')} />

        {booking.POLName !== booking.PlaceOfRecieptName ? (
          <TableRowData
            label={'Place of Receipt'}
            content={[booking.PlaceOfRecieptName, formatDateString(booking.PlaceOfReceiptETS)].join('<br/>ETS: ')}
          />
        ) : null}

        <TableRowData
          label={'Port of Loading'}
          content={[booking.POLName, formatDateString(booking.ETS)].join('<br/>ETS: ')}
        />
        <TableRowData
          label={'Port of Discharge'}
          content={[booking.PODName, formatDateString(booking.ETA)].join('<br/>ETA: ')}
        />

        {booking.PODName !== booking.FinalDestinationName ? (
          <TableRowData
            label={'Place of Delivery'}
            content={[booking.FinalDestinationName, formatDateString(booking.FinalDestinationETA)].join('<br/>ETA: ')}
          />
        ) : null}

        <TableRowData label={'B/L-NO'} content={booking['BL-No']} />

        {booking.BkgAgentContact ? (
          <TableRowData label={'Booking Agent Contact'} content={booking.BkgAgentContact} />
        ) : null}

        <TableRowData label={'Carrier'} content={booking.CarrierID.toUpperCase()} />

        <TableRow className={classes.tableRow}>
          <TableCell className={classes.tableCellLabel}>Client</TableCell>
          <TableCell className={classes.tableCell}>{clientInfo}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default BookingSummary;
