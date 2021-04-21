import {
  Box,
  createStyles,
  makeStyles,
  Table,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Theme,
} from '@material-ui/core';
import TableBody from '@material-ui/core/TableBody';
import React from 'react';
import { RouteSearchResult } from '../../model/route-search/RouteSearchResults';
import { useBookingRequestContext } from '../../providers/BookingRequestProvider';

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

const BookingRequestClosings: React.FC<Props> = ({ editing }) => {
  const classes = useStyles();
  const [bookingRequest, setBookingRequest] = useBookingRequestContext();

  const handleChangeClosing = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, index: number) => {
    const newDeadlines = bookingRequest?.schedule?.Deadlines.map((deadline, deadlineIndex) =>
      index === deadlineIndex ? { ...deadline, Time: event.target.value } : deadline,
    );
    bookingRequest &&
      setBookingRequest &&
      setBookingRequest({
        ...bookingRequest,
        schedule: {
          ...bookingRequest.schedule,
          Deadlines: newDeadlines,
        } as RouteSearchResult,
      });
  };

  return bookingRequest && bookingRequest.schedule?.Deadlines && setBookingRequest ? (
    <Box className={classes.tableWrapper} marginTop="1em" marginBottom="1em">
      <Table className={classes.table} size="small">
        <TableHead className={classes.tableHead}>
          <TableRow className={classes.tableRow}>
            <TableCell>Closing for</TableCell>
            <TableCell>Date/Time</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookingRequest.schedule?.Deadlines.map((item, index) => {
            return (
              <TableRow key={`booking-request-closing-${item.Typ}`} className={classes.tableRow}>
                <TableCell>{item.Typ}</TableCell>
                <TableCell style={{ minWidth: '8em' }}>
                  {editing ? (
                    <TextField
                      label={''}
                      fullWidth
                      value={item.Time}
                      onChange={event => handleChangeClosing(event, index)}
                      variant="outlined"
                      margin="dense"
                    />
                  ) : (
                    item.Time
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  ) : null;
};

interface Props {
  editing?: boolean;
}

export default BookingRequestClosings;
