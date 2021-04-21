import React, { useEffect, useMemo } from 'react';
import { RouteComponentProps, useHistory } from 'react-router';
import useFirestoreDocument from '../../hooks/useFirestoreDocument';
import { Container, makeStyles, Paper, Theme } from '@material-ui/core';
import ChartsCircularProgress from '../../components/dashboard/ChartsCircularProgress';
import { BookingRequest } from '../../model/BookingRequest';
import BookingRequestView from './BookingRequestView';
import { normalizeBookingRequest } from '../../providers/BookingRequestsProvider';
import BookingRequestProvider, { useBookingRequestContext } from '../../providers/BookingRequestProvider';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}));

interface ContentProps {
  bookingRequest: BookingRequest | undefined;
}
const BookingRequestContainerContent: React.FC<ContentProps> = ({ bookingRequest }) => {
  const classes = useStyles();
  const [bookingRequestState, setBookingRequestState] = useBookingRequestContext();

  useEffect(() => {
    setBookingRequestState && setBookingRequestState(bookingRequest);
  }, [bookingRequest]);

  return !bookingRequestState ? (
    <Container maxWidth="lg">
      <Paper className={classes.root}>
        <ChartsCircularProgress />
      </Paper>
    </Container>
  ) : (
    <BookingRequestProvider>
      <BookingRequestView bookingRequest={bookingRequestState} />
    </BookingRequestProvider>
  );
};

interface Props extends RouteComponentProps<{ id: string }> {}

const BookingRequestContainer: React.FC<Props> = ({ match }) => {
  const bookingRequestId = match.params.id;

  const history = useHistory();
  const bookingRequestSnapshot = useFirestoreDocument('bookings-requests', bookingRequestId);

  const bookingRequestDoc = bookingRequestSnapshot
    ? ({ id: bookingRequestSnapshot.id, ...bookingRequestSnapshot.data() } as BookingRequest)
    : undefined;

  const bookingRequest = useMemo(
    () => (bookingRequestDoc ? (normalizeBookingRequest(bookingRequestDoc) as BookingRequest) : undefined),
    [bookingRequestDoc],
  );

  if (bookingRequestSnapshot === null || (bookingRequestSnapshot && !bookingRequestSnapshot.exists)) {
    history.push('/not-found');
  }

  return (
    <BookingRequestProvider>
      <BookingRequestContainerContent bookingRequest={bookingRequest} />
    </BookingRequestProvider>
  );
};

export default BookingRequestContainer;
