import React, { useMemo } from 'react';
import BookingsContext from '../contexts/Bookings';
import useUser from '../hooks/useUser';
import useFirestoreCollection from '../hooks/useFirestoreCollection';
import { Booking } from '../model/Booking';
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

  const bookingsResult = useMemo(() => {
    const bookings = bookingsSnapshot?.docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data(),
      } as Booking;
    }) as Booking[] | undefined;

    const normalizedBookings = map(
      flow(
        update('createdAt', invoke('toDate')),
        update('updatedAt', invoke('toDate')),
        update('TimeStamp', invoke('toDate')),
        update('PlaceOfReceiptETS', invoke('toDate')),
        update('FinalDestinationETA', invoke('toDate')),
        update('ETS', invoke('toDate')),
        update('ETA', invoke('toDate')),
      ),
    );

    return normalizedBookings(bookings);
  }, [bookingsSnapshot]);

  return <BookingsContext.Provider value={bookingsResult}>{children}</BookingsContext.Provider>;
};

export default Bookings;
