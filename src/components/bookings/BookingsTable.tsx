import React, { useMemo, Fragment } from 'react';
import { useHistory } from 'react-router';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  createStyles,
  makeStyles,
  Theme,
  Typography
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import formatDate from 'date-fns/format';
import { Booking } from '../../model/Booking';
import useClients from '../../hooks/useClients';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tableRow: {
      '& td': {
        whiteSpace: 'nowrap'
      }
    }
  })
);

interface Props {
  bookings?: Booking[] | null;
  showCompanyInfo?: boolean;
}

interface RowProps {
  showCompanyInfo?: boolean;
  booking: Booking;
}

const formatDateString = (date: string) => formatDate(new Date(date), 'd. MMMM');

const formatEstimatedDate = (date: string) => {
  if(date.indexOf('.') < 0) {
    return date;
  }

  let dateParts = date.split('.');

  return [dateParts[0], dateParts[1]].join('.');
};

const BookingsTableBodySekeleton: React.FC = () => (
  <Fragment>
    {[...Array(7)].map((_, i) => (
      <TableRow key={i}>
        <TableCell>
          <Skeleton width={50} height={16} style={{ margin: 0 }} />
        </TableCell>
        <TableCell>
          <Skeleton width={140} height={16} style={{ margin: 0 }} />
        </TableCell>
        <TableCell>
          <Skeleton width={65} height={16} style={{ margin: 0 }} />
        </TableCell>
        <TableCell>
          <Skeleton width={140} height={16} style={{ margin: 0 }} />
        </TableCell>
        <TableCell>
          <Skeleton width={140} height={16} style={{ margin: 0 }} />
        </TableCell>
      </TableRow>
    ))}
  </Fragment>
);

const BookingRow: React.FC<RowProps> = ({ showCompanyInfo, booking }) => {
  const classes = useStyles();
  const clients = useClients();
  const history = useHistory();

  const client = useMemo(() => clients?.find(client => client.id === booking.ForwAdrId), [
    clients,
    booking.ForwAdrId,
  ]);

  const clientInfo = useMemo(() => {
    if ( !showCompanyInfo ) return null;

    if ( !client ) {
      return <TableCell>{booking.ForwAdrId}</TableCell>;
    }

    if(booking.ForwarderPersTxt || booking['Cust-BkgRef']) {
      return (
        <TableCell>
          {client.name}
          <Typography variant="body2">
            {booking.ForwarderPersTxt && booking.ForwarderPersTxt}
            {(booking.ForwarderPersTxt && booking['Cust-BkgRef']) ? ' - ' : null}
            {booking['Cust-BkgRef'] && booking['Cust-BkgRef']}
          </Typography>
        </TableCell>
      );
    }

    return <TableCell>{client.name}</TableCell>;
  }, [showCompanyInfo, client, booking.ForwAdrId]);

  const handleRowClick = (event: React.MouseEvent<unknown>, id: string) => {
    history.push(`/bookings/${id}`);
  };

  return (
      <TableRow
        hover
        tabIndex={-1}
        className={classes.tableRow}
        onClick={event => handleRowClick(event, booking.id)}
        key={booking.id}
      >
        {clientInfo}
        <TableCell>{booking.CarrierID}</TableCell>
        <TableCell>
          {booking.Vessel}<br/>
          Voyage Number {booking.Voyage}
        </TableCell>
        <TableCell>
          {booking.PlaceOfRecieptName}<br />
          ETS. {formatEstimatedDate(booking.ETS)}
        </TableCell>
        <TableCell>{booking['BL-No']}</TableCell>
        <TableCell>{booking['Cust-BkgRef']}</TableCell>
        <TableCell>
          {booking.FinalDestinationName}<br />
          ETA. {formatEstimatedDate(booking.ETA)}
        </TableCell>
        <TableCell>{booking.BkgStatus || 'N/A'}</TableCell>
        <TableCell>{formatDateString(booking.TimeStamp)}</TableCell>
    </TableRow>
  );
};

const BookingsTable: React.FC<Props> = ({ bookings, showCompanyInfo }) => {
  console.log('bookings: ', bookings);

  return (
    <Table>
      <TableHead>
        <TableRow>
          {showCompanyInfo && <TableCell>Client</TableCell>}
          <TableCell>Carrier</TableCell>
          <TableCell>Vessel</TableCell>
          <TableCell>Origin</TableCell>

          <TableCell>Booking No.</TableCell>
          <TableCell>Your Reference</TableCell>

          <TableCell>Destination</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Last Update</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {!bookings ? (
          <BookingsTableBodySekeleton />
        ) : (
          bookings.map(booking => (
            <BookingRow key={`booking-row-${booking.id}`} showCompanyInfo={showCompanyInfo} booking={booking} />
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default BookingsTable;
