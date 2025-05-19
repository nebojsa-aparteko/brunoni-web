import React, { useMemo } from 'react';
import { RouteComponentProps } from 'react-router';
import BookingView from '../components/bookings/BookingView';
import { normalizeBooking } from '../providers/BookingsProvider';
import useFirestoreDocument from '../hooks/useFirestoreDocument';
import { Booking } from '../model/Booking';
import { Container, makeStyles, Paper, Theme } from '@material-ui/core';
import ChartsCircularProgress from '../components/dashboard/ChartsCircularProgress';
import { useHistory } from 'react-router';
import Tags from '../contexts/Tags';
import { TagCategory } from '../model/Tag';
import FirestoreCollectionProvider from '../providers/FirestoreCollection';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}));

interface Props extends RouteComponentProps<{ id: string }> {}

const BookingContainer: React.FC<Props> = ({ match }) => {
  const classes = useStyles();
  const bookingId = match.params.id;

  const history = useHistory();
  const bookingSnapshot = useFirestoreDocument('bookings', bookingId);

  const bookingDoc = bookingSnapshot
    ? ({ id: bookingSnapshot.id, ...bookingSnapshot.data() } as Booking)
    : undefined;

  const booking = useMemo(
    () => (bookingDoc ? normalizeBooking(bookingDoc) : undefined),
    [bookingDoc],
  );

  if (bookingSnapshot === null || (bookingSnapshot && !bookingSnapshot.exists)) {
    history.push('/not-found');
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
