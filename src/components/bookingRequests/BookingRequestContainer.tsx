import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, makeStyles, Paper, Theme } from '@material-ui/core';
import ChartsCircularProgress from '../../components/dashboard/ChartsCircularProgress';
import { BookingRequest } from '../../model/BookingRequest';
import BookingRequestView from './BookingRequestView';
import BookingRequestProvider, {
  useBookingRequestContext,
} from '../../providers/BookingRequestProvider';
import SpecialRemarks from '../../contexts/SpecialRemarks';
import FirestoreCollectionProvider from '../../providers/FirestoreCollection';
import ChargeCodes from '../../contexts/ChargeCodes';
import PortTerms from '../../contexts/PortTerms';
import useBookingRequest from '../../hooks/useBookingRequest';
import { map, update, flow } from 'lodash/fp';
import Tags from '../../contexts/Tags';
import { TagCategory } from '../../model/Tag';

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
    setBookingRequestState &&
      setBookingRequestState(
        update(
          'containers',
          map((container: any) =>
            flow(
              update('imo', val => (val ? [true, val] : [false])),
              update('oog', val => (val ? [true, val] : [false])),
            )(container),
          ),
        )(bookingRequest!),
      );
  }, [bookingRequest]);

  return !bookingRequestState ? (
    <Container maxWidth="lg">
      <Paper className={classes.root}>
        <ChartsCircularProgress />
      </Paper>
    </Container>
  ) : (
    <BookingRequestProvider>
      <FirestoreCollectionProvider name="special-remarks" context={SpecialRemarks}>
        <FirestoreCollectionProvider
          name="charge-codes"
          context={ChargeCodes}
          // query={query => query.where('language', '==', 'E')}
        >
          <FirestoreCollectionProvider
            name="tags"
            context={Tags}
            query={query => query.where('category', '==', TagCategory.BOOKING_REQUEST)}
          >
            <FirestoreCollectionProvider name="port-terms" context={PortTerms}>
              <BookingRequestView bookingRequest={bookingRequestState} />
            </FirestoreCollectionProvider>
          </FirestoreCollectionProvider>
        </FirestoreCollectionProvider>
      </FirestoreCollectionProvider>
    </BookingRequestProvider>
  );
};

const BookingRequestContainer: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const bookingRequest = useBookingRequest(id || '');

  useEffect(() => {
    if (!bookingRequest.exists) {
      navigate('/not-found', { replace: true });
    }
  }, [bookingRequest.exists, navigate]);

  return (
    <BookingRequestProvider>
      <BookingRequestContainerContent bookingRequest={bookingRequest.br} />
    </BookingRequestProvider>
  );
};

export default BookingRequestContainer;
