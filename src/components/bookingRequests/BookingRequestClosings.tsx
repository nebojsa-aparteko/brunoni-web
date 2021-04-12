import { Box, createStyles, makeStyles, Table, TableCell, TableHead, TableRow, Theme } from '@material-ui/core';
import TableBody from '@material-ui/core/TableBody';
import React from 'react';
import { BookingRequest } from '../../model/BookingRequest';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    table: {
      minWidth: 650,
      overflowX: 'auto',
    },
    tableHead: {
      fontWeight: theme.typography.fontWeightBold,
    },
    tableRow: {
      verticalAlign: 'top',
      ['@media print']: {
        '& td': {
          padding: theme.spacing(0),
        },
      },
    },
    tableWrapper: {
      overflowX: 'auto',
    },
  }),
);

const BookingRequestClosings: React.FC<Props> = ({ bookingRequest }) => {
  const classes = useStyles();
  return (
    <Box className={classes.tableWrapper} marginTop="1em" marginBottom="1em">
      <Table className={classes.table} size="small">
        <TableHead className={classes.tableHead}>
          <TableRow className={classes.tableRow}>
            <TableCell>Closing for</TableCell>
            <TableCell>Date/Time</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookingRequest.schedule?.Deadlines &&
            bookingRequest.schedule?.Deadlines.map(item => {
              return (
                <TableRow key={`booking-request-closing-${item.Typ}`} className={classes.tableRow}>
                  <TableCell>{item.Typ}</TableCell>
                  <TableCell style={{ minWidth: '8em' }}>{item.Time}</TableCell>
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </Box>
  );
};

interface Props {
  bookingRequest: BookingRequest;
}

export default BookingRequestClosings;
