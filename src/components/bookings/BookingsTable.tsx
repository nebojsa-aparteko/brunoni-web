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
import {
  Booking,
  BookingCategory,
  ExportShipmentStatusCode,
  ImportShipmentStatusCode
} from '../../model/Booking';
import useClients from '../../hooks/useClients';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tableRow: {
      '& td': {
        whiteSpace: 'nowrap'
      }
    },
    progress: {
      width: '100%',
      backgroundColor: 'white',
      border: '1px solid #ccc',
    },
    progressBar: {
      width: '0%',
      height: '20px',
      backgroundColor: 'green',
    },
    avatarCell: {
      textAlign: 'center',
    },
    avatar: {
      width: '40px',
      height: '40px',
      borderRadius: '20px',
      display: 'block'
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

interface BookingStatuses {
  [key: string]: {
    [key: string]: string;
  };
}

const bookingStatus: BookingStatuses = {
  export: {
    status10: 'CONFIRMED',
    status20: 'CONFIRMED / DEPOT OUT',
    status30: 'CONFIRMED / GATE IN',
    status40: 'SHIPPED ON BOARD'
  },
  import: {
    status1: 'ON WATER',
    status2: 'ARRIVED AT POD',
    status3: 'ARRIVED AT POD / GATE OUT TERMINAL',
    status4: 'EMPTY RETURNED'
  }
}

const getBookingStatus = (
  category: BookingCategory,
  statusCode: ExportShipmentStatusCode | ImportShipmentStatusCode | null
): string | undefined => {
  const categoryName = category.toLowerCase();

  if(categoryName in bookingStatus) {
    return bookingStatus[categoryName][`status${statusCode}`];
  }
};

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
    {[...Array(10)].map((_, i) => (
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
        <TableCell>
          <Skeleton width={140} height={16} style={{ margin: 0 }} />
        </TableCell>
        <TableCell>
          <Skeleton width={140} height={16} style={{ margin: 0 }} />
        </TableCell>
        <TableCell>
          <Skeleton width={140} height={16} style={{ margin: 0 }} />
        </TableCell>
        <TableCell>
          <Skeleton width={140} height={16} style={{ margin: 0 }} />
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

const ShipmentProgress: React.FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.progress}>
      <div className={classes.progressBar} role="progressbar" style={{width: '40%'}}></div>
    </div>
  );
};

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

    return (
      <TableCell>
        {client.name}
        {booking.ForwPersID ? (
          <Typography variant="body2">
            {booking.ForwPersID}
          </Typography>
        ) : null}
      </TableCell>
    );
  }, [showCompanyInfo, client, booking]);

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
        <TableCell>
          {booking.CarrierID}
          {showCompanyInfo && (booking['ERP-CarrierID'] || booking['ERP-ServiceID']) ? (
            <Typography variant="body2">
              {booking['ERP-CarrierID'] && booking['ERP-CarrierID']}
              {(booking['ERP-CarrierID'] && booking['ERP-ServiceID']) ? ' - ' : null}
              {booking['ERP-ServiceID'] && booking['ERP-ServiceID']}
            </Typography>
          ) : null}
        </TableCell>
        <TableCell>
          {booking.Vessel}<br/>
          Voyage Number {booking.Voyage}
        </TableCell>
        <TableCell>
          {booking.PlaceOfRecieptName}<br />
          ETS. {formatEstimatedDate(booking.ETS)}
        </TableCell>
        <TableCell>
          {booking.FinalDestinationName}<br />
          ETA. {formatEstimatedDate(booking.ETA)}
        </TableCell>
        <TableCell>{booking['BL-No']}</TableCell>
        <TableCell>{booking['Cust-BkgRef']}</TableCell>
        <TableCell>
          {getBookingStatus(booking.Category, booking.BkgStatus)}
        </TableCell>
        <TableCell>{formatDateString(booking.TimeStamp)}</TableCell>
        <TableCell className={classes.avatarCell}>
          <img className={classes.avatar} src="https://trello-members.s3.amazonaws.com/5db6fc90458fa40143f689f3/85b18ae1d817ab32d6b577184905713e/170.png" alt="Nenad" />
        </TableCell>
        <TableCell>
          <ShipmentProgress />
        </TableCell>
    </TableRow>
  );
};

const BookingsTable: React.FC<Props> = ({ bookings, showCompanyInfo }) => {
  const classes = useStyles();

  console.log('bookings: ', bookings);

  return (
    <Table>
      <TableHead>
        <TableRow>
          {showCompanyInfo && <TableCell>Client</TableCell>}
          <TableCell>Carrier</TableCell>
          <TableCell>Vessel</TableCell>
          <TableCell>Origin</TableCell>
          <TableCell>Destination</TableCell>
          <TableCell>Booking Number</TableCell>
          <TableCell>Your Reference</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Date</TableCell>
          <TableCell className={classes.avatarCell}>Contact</TableCell>
          <TableCell>Progress</TableCell>
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
