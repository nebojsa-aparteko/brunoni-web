import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import BookingView from '../components/bookings/BookingView';
import { normalizeBooking } from '../providers/BookingsProvider';
import useFirestoreDocument from '../hooks/useFirestoreDocument';
import { Booking } from '../model/Booking';
import { Container, makeStyles, Paper, Theme } from '@material-ui/core';
import ChartsCircularProgress from '../components/dashboard/ChartsCircularProgress';
import { useNavigate } from 'react-router-dom';
import Tags from '../contexts/Tags';
import { TagCategory } from '../model/Tag';
import FirestoreCollectionProvider from '../providers/FirestoreCollection';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}));

const BookingContainer: React.FC = () => {
  const classes = useStyles();
  const { id: bookingId } = useParams();
  const navigate = useNavigate();
  const bookingSnapshot = useFirestoreDocument('bookings', bookingId);

  const bookingDoc = bookingSnapshot
    ? ({ id: bookingSnapshot.id, ...bookingSnapshot.data() } as Booking)
    : undefined;

  const booking = useMemo(
    () => (bookingDoc ? normalizeBooking(bookingDoc) : undefined),
    [bookingDoc],
  );

  if (bookingSnapshot === null || (bookingSnapshot && !bookingSnapshot.exists)) {
    navigate('/not-found');
  }

  return !booking ? (
    <Container maxWidth="lg">
      <Paper className={classes.root}>
        <ChartsCircularProgress />
      </Paper>
    </Container>
  ) : (
    <FirestoreCollectionProvider
      name="tags"
      context={Tags}
      query={query => query.where('category', '==', TagCategory.BOOKING)}
    >
      <BookingView booking={booking} />
    </FirestoreCollectionProvider>
  );
};

export default BookingContainer;
