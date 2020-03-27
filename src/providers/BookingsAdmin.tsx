import React, { useMemo } from 'react';
import BookingsContext from '../contexts/Bookings';
import { Booking, BookingExtension } from '../model/Booking';
import useFirestoreCollection from '../hooks/useFirestoreCollection';

interface Props {
  children: React.ReactNode;
}

const BookingsAdmin: React.FC<Props> = ({ children }) => {
  const bookingsSnapshot = useFirestoreCollection('bookings');
  const bookingsExtensionSnapshot = useFirestoreCollection('bookings-extension');

  const bookingsResult = useMemo(() => {
    const bookingsExtension = bookingsExtensionSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)) as BookingExtension[] | undefined;

    const bookings = bookingsSnapshot?.docs.map(doc => {
      let ext = bookingsExtension?.find(ext => doc.id === ext.id);

      return ({
        id: doc.id,
        ...doc.data(),
        ...ext
      } as Booking);
    }) as Booking[] | undefined;

    return bookings;
  }, [bookingsSnapshot, bookingsExtensionSnapshot]);

  return <BookingsContext.Provider value={bookingsResult}>{children}</BookingsContext.Provider>;
};

export default BookingsAdmin;
