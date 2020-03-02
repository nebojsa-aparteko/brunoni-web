import React from 'react';
import { useHistory } from 'react-router';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  createStyles,
  makeStyles,
  Theme
} from '@material-ui/core';
import formatDate from 'date-fns/format';
import { Booking } from '../../model/Booking';

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

const formatDateString = (date: string) => formatDate(new Date(date), 'd. MMMM');

const formatEstimatedDate = (date: string) => {
  if(date.indexOf('.') < 0) {
    return date;
  }

  let dateParts = date.split('.');

  return [dateParts[0], dateParts[1]].join('.');
};

const BookingsTable: React.FC<Props> = ({ bookings, showCompanyInfo }) => {
  const classes = useStyles();
  const history = useHistory();

  const handleRowClick = (event: React.MouseEvent<unknown>, id: string) => {
    history.push(`/bookings/${id}`);
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          {showCompanyInfo ? (
            <TableCell>Client</TableCell>
          ) : null}
          <TableCell>Carrier</TableCell>
          <TableCell>Vessel</TableCell>
          <TableCell>Origin</TableCell>
          <TableCell>Destination</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Time Stamp</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {bookings?.map(booking => {
          return (
            <TableRow
              hover
              tabIndex={-1}
              className={classes.tableRow}
              onClick={event => handleRowClick(event, booking.id)}
              key={booking.id}
            >
              {showCompanyInfo ? (
                <TableCell>{booking.ForwAdrId}</TableCell>
              ) : null}
              <TableCell>{booking.CarrierID}</TableCell>
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
              <TableCell>{booking.BkgStatus || 'N/A'}</TableCell>
              <TableCell>{formatDateString(booking.TimeStamp)}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default BookingsTable;
