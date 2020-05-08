import React, { useMemo } from 'react';
import { RouteComponentProps } from 'react-router';
import BookingView from '../components/bookings/BookingView';
import { normalizeBooking } from '../providers/BookingsProvider';
import useFirestoreDocument from '../hooks/useFirestoreDocument';
import { Booking } from '../model/Booking';
import { Container, makeStyles, Paper, Theme } from '@material-ui/core';
import ChartsCircularProgress from '../components/dashboard/ChartsCircularProgress';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}));

interface Props extends RouteComponentProps<{ id: string }> {}

const BookingContainer: React.FC<Props> = ({ match }) => {
  const classes = useStyles();
  const bookingId = match.params.id;
  const bookingSnapshot = useFirestoreDocument('bookings', bookingId);

  const bookingDoc = bookingSnapshot ? ({ id: bookingSnapshot.id, ...bookingSnapshot.data() } as Booking) : undefined;

  const booking = useMemo(() => (bookingDoc ? normalizeBooking(bookingDoc) : undefined), [bookingDoc]);

  return !booking ? (
    <Container maxWidth="lg">
      <Paper className={classes.root}>
        <ChartsCircularProgress />
      </Paper>
    </Container>
  ) : (
    <BookingView booking={booking} />
  );
};

export default BookingContainer;
