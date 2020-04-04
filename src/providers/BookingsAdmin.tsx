import React, { useMemo } from 'react';
import BookingsContext from '../contexts/Bookings';
import { Booking, BookingExtension } from '../model/Booking';
import useFirestoreCollection from '../hooks/useFirestoreCollection';

interface Props {
  children: React.ReactNode;
}

const BookingsAdmin: React.FC<Props> = ({ children }) => {
  //
  // FIXME: There is some issue with Firebase and it cannot use just a limit and as well orders do not work by document ID
  //
  // const bookingsSnapshot = useFirestoreCollection('bookings', (collection: firebase.firestore.CollectionReference) =>
  //   collection.orderBy(firebase.firestore.FieldPath.documentId(), 'desc').limit(500)
  // );
  // const bookingsExtensionSnapshot = useFirestoreCollection(
  //   'bookings-extension',
  //   (collection: firebase.firestore.CollectionReference) => collection.limit(500),
  // );

  const bookingsSnapshot = useFirestoreCollection('bookings');
  const bookingsExtensionSnapshot = useFirestoreCollection('bookings-extension');

  const bookingsResult = useMemo(() => {
    const bookingsExtension = bookingsExtensionSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)) as
      | BookingExtension[]
      | undefined;

    return bookingsSnapshot?.docs.map(doc => {
      let ext = bookingsExtension?.find(ext => doc.id === ext.id);

      return {
        id: doc.id,
        ...doc.data(),
        ...ext,
      } as Booking;
    }) as Booking[] | undefined;
  }, [bookingsSnapshot, bookingsExtensionSnapshot]);

  return <BookingsContext.Provider value={bookingsResult}>{children}</BookingsContext.Provider>;
};

export default BookingsAdmin;
