import useFirestoreCollection from './useFirestoreCollection';
import { useMemo } from 'react';
import firebase from '../firebase';
import { normalizeBookingRequest } from '../providers/BookingRequestsProvider';
import { BookingRequest } from '../model/BookingRequest';

export default (
  query?: (
    collection: firebase.firestore.Query,
  ) => firebase.firestore.Query<firebase.firestore.DocumentData>,
) => {
  const bookingRequestsCollection = useFirestoreCollection('bookings-requests', query);

  return useMemo(
    () =>
      bookingRequestsCollection?.docs.map(
        doc =>
          ({
            id: doc.id,
            path: doc.ref.path,
            ...normalizeBookingRequest(doc.data()),
          }) as BookingRequest,
      ),
    [bookingRequestsCollection],
  );
};
