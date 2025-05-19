import useFirestoreCollection from './useFirestoreCollection';
import { useMemo } from 'react';
import firebase from '../firebase';
import { normalizeBooking } from '../providers/BookingsProvider';
import { Booking } from '../model/Booking';

export default (
  query?: (
    collection: firebase.firestore.Query,
  ) => firebase.firestore.Query<firebase.firestore.DocumentData>,
) => {
  const bookingRequestsCollection = useFirestoreCollection('bookings', query);

  return useMemo(
    () =>
      bookingRequestsCollection?.docs.map(
        doc => ({ id: doc.id, path: doc.ref.path, ...normalizeBooking(doc.data()) }) as Booking,
      ),
    [bookingRequestsCollection],
  );
};
