import React, { useMemo } from 'react';
import { RouteComponentProps, useHistory } from 'react-router';
import useFirestoreDocument from '../../hooks/useFirestoreDocument';
import { Container, makeStyles, Paper, Theme } from '@material-ui/core';
import ChartsCircularProgress from '../../components/dashboard/ChartsCircularProgress';
import { BookingRequest } from '../../model/BookingRequest';
import BookingRequestView from './BookingRequestView';
import { normalizeBookingRequest } from '../../providers/BookingRequestsProvider';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}));

interface Props extends RouteComponentProps<{ id: string }> {}

const BookingRequestContainer: React.FC<Props> = ({ match }) => {
  const classes = useStyles();
  const bookingRequestId = match.params.id;

  const history = useHistory();
  const bookingRequestSnapshot = useFirestoreDocument('booking-requests', bookingRequestId);

  const bookingRequestDoc = bookingRequestSnapshot
    ? ({ id: bookingRequestSnapshot.id, ...bookingRequestSnapshot.data() } as BookingRequest)
    : undefined;

  const bookingRequest = useMemo(() => (bookingRequestDoc ? normalizeBookingRequest(bookingRequestDoc) : undefined), [
    bookingRequestDoc,
  ]);

  if (bookingRequestSnapshot === null || (bookingRequestSnapshot && !bookingRequestSnapshot.exists)) {
    history.push('/not-found');
  }

  return !bookingRequest ? (
    <Container maxWidth="lg">
      <Paper className={classes.root}>
        <ChartsCircularProgress />
      </Paper>
    </Container>
  ) : (
    <BookingRequestView bookingRequest={bookingRequest} />
  );
};

export default BookingRequestContainer;
