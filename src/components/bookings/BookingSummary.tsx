import React, { useMemo } from 'react';
import { Table, TableCell, TableRow, makeStyles } from '@material-ui/core';
import TableBody from '@material-ui/core/TableBody';
import { Booking } from '../../model/Booking';
import useClients from '../../hooks/useClients';

interface Props {
  booking: Booking;
}

const useStyles = makeStyles(theme => ({
  tableCellLabel: {
    paddingLeft: 0,
    border: 'none',
    fontWeight: 700,
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

const TableRowData: React.FC<TableRowProps> = ({ label, content }) => {
  const classes = useStyles();

  return (
    <TableRow className={classes.tableRow}>
      <TableCell className={classes.tableCellLabel}>{label}</TableCell>
      <TableCell className={classes.tableCell} dangerouslySetInnerHTML={{ __html: content}} />
    </TableRow>
  );
};

const BookingSummary: React.FC<Props> = ({ booking }) => {
  const clients = useClients();

  const client = useMemo(() => clients?.find(client => client.id === booking.ForwAdrId), [
    clients,
    booking.ForwAdrId,
  ]);

  const clientInfo = useMemo(() => {
    if ( !client ) {
      return booking.ForwAdrId;
    }

    return client.name;
  }, [client, booking.ForwAdrId]);

  return (
    <Table size="small" aria-label="a dense table">
       <colgroup>
        <col style={{ width: '40%' }} />
        <col style={{ width: '60%' }} />
      </colgroup>
      <TableBody>
        <TableRowData
          label={'Vessel'}
          content={[booking.Vessel, booking.Voyage].join(' VOY. ')}
        />
        <TableRowData
          label={'Place of Receipt'}
          content={booking.PlaceOfRecieptName}
        />
        <TableRowData
          label={'Port of Loading'}
          content={[ booking.POLName, booking.ETS ].join('<br/>ETS: ')}
        />
        <TableRowData
          label={'Port of Discharge'}
          content={[booking.PODName, booking.ETA].join('<br/>ETA: ')}
        />
        <TableRowData
          label={'Place of Delivery'}
          content={booking.FinalDestinationName}
        />

        <TableRowData label={'B/L-NO'} content={booking['BL-No']} />

        {booking.BkgAgentContact ? (
          <TableRowData label={'Booking Agent Contact'} content={booking.BkgAgentContact} />
        ) : null}

        <TableRowData label={'Carrier'} content={booking.CarrierID} />
        <TableRowData label={'Client'} content={clientInfo} />
      </TableBody>
    </Table>
  );
};

export default BookingSummary;
