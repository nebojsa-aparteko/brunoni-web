import React, { useMemo } from 'react';
import BookingsContext from '../contexts/Bookings';
import useUser from '../hooks/useUser';
import useFirestoreCollection from '../hooks/useFirestoreCollection';
import { Booking, BookingExtension } from '../model/Booking';
import map from 'lodash/fp/map';
import flow from 'lodash/fp/flow';
import update from 'lodash/fp/update';
import invoke from 'lodash/fp/invoke';

interface Props {
  children: React.ReactNode;
}

const Bookings: React.FC<Props> = ({ children }) => {
  const userRecord = useUser()[1];

  const query = userRecord?.alphacomClientId
    ? (collection: firebase.firestore.CollectionReference) =>
        collection.where('ForwAdrId', '==', userRecord!.alphacomClientId)
    : (collection: firebase.firestore.CollectionReference) => collection.where('ForwAdrId', '>', '');

  const bookingsSnapshot = useFirestoreCollection('bookings', query);
  const bookingsExtensionSnapshot = useFirestoreCollection('bookings-extension', query);

  const bookingsResult = useMemo(() => {
    const bookingsExtension = bookingsExtensionSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)) as
      | BookingExtension[]
      | undefined;

    const bookings = bookingsSnapshot?.docs.map(doc => {
      let ext = bookingsExtension?.find(ext => doc.id === ext.id);

      return {
        id: doc.id,
        ...doc.data(),
        ...ext,
      } as Booking;
    }) as Booking[] | undefined;

    const normalizedBookings = map(
      flow(
        update('BkgCreateTimeStamp', invoke('toDate')),
        update('TimeStamp', invoke('toDate')),
        update('PlaceOfReceiptETS', invoke('toDate')),
        update('FinalDestinationETA', invoke('toDate')),
        update('ETS', invoke('toDate')),
        update('ETA', invoke('toDate')),
      ),
    );

    return normalizedBookings(bookings);
  }, [bookingsSnapshot, bookingsExtensionSnapshot]);

  return <BookingsContext.Provider value={bookingsResult}>{children}</BookingsContext.Provider>;
};

export default Bookings;
