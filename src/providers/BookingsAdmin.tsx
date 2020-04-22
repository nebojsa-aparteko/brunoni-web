import React, { useMemo } from 'react';
import BookingsContext from '../contexts/Bookings';
import { Booking } from '../model/Booking';
import useFirestoreCollection from '../hooks/useFirestoreCollection';
import { normalizeBookings } from './BookingsProvider';

interface Props {
  children: React.ReactNode;
}

const BookingsAdmin: React.FC<Props> = ({ children }) => {
  // const bookingsSnapshot = useFirestoreCollection('bookings', (collection: firebase.firestore.CollectionReference) =>
  //   collection.orderBy('ERP-BkgRef', 'desc').limit(500)
  // );
  // const bookingsExtensionSnapshot = useFirestoreCollection(
  //   'bookings-extension',
  //   (collection: firebase.firestore.CollectionReference) => collection.orderBy('ERP-BkgRef', 'desc').limit(500),
  // );

  const bookingCollection = useFirestoreCollection('bookings');

  const bookingsResult = useMemo(() => {
    return normalizeBookings(
      bookingCollection?.docs.map(doc => {
        return {
          id: doc.id,
          ...doc.data(),
        } as Booking;
      }),
    ) as Booking[] | undefined;
  }, [bookingCollection]);

  return <BookingsContext.Provider value={bookingsResult}>{children}</BookingsContext.Provider>;
};

export default BookingsAdmin;
