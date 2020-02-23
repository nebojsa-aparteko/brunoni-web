import React from 'react';
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
import { Booking } from '../model/Booking';

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
  data?: Booking[] | null;
}

const BookingsTable: React.FC<Props> = ({ data }) => {
  const classes = useStyles();

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>Carrier ID</TableCell>
          <TableCell>Category</TableCell>
          <TableCell>Final Destination Name</TableCell>
          <TableCell>Forward Address ID</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data?.map(booking => {
          return (
            <TableRow className={classes.tableRow}>
              <TableCell>{booking.id}</TableCell>
              <TableCell>{booking.CarrierID}</TableCell>
              <TableCell>{booking.Category}</TableCell>
              <TableCell>{booking.FinalDestinationName}</TableCell>
              <TableCell>{booking.ForwAdrId}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default BookingsTable;
