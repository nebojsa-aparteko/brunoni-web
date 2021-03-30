import React, { createContext, useContext, useMemo, useState } from 'react';
import useUser from '../hooks/useUser';
import useFirestoreCollection from '../hooks/useFirestoreCollection';
import map from 'lodash/fp/map';
import flow from 'lodash/fp/flow';
import update from 'lodash/fp/update';
import invoke from 'lodash/fp/invoke';
import ActingAs from '../contexts/ActingAs';
import firebase from '../firebase';
import { BookingRequest } from '../model/BookingRequest';
import safeInvoke from '../utilities/safeInvoke';

interface Props {
  children: React.ReactNode;
}

export const normalizeBookingRequest = flow(
  update('createdAt', invoke('toDate')),
  update('containers', flow(map(flow(update('pickupDate', safeInvoke('toDate')))))),
);

export const normalizeBookingRequests = map(normalizeBookingRequest);

const BookingRequestsContext = createContext<[BookingRequest[] | undefined, boolean]>([undefined, true]);

export const useBookingRequestsContext = () => {
  const context = React.useContext(BookingRequestsContext);
  if (context === undefined) {
    throw new Error('useBookingsContext must be used within a BookingsProvider');
  }
  return context;
};

const BookingRequestsProvider: React.FC<Props> = ({ children }) => {
  const userRecord = useUser()[1];
  const actingAs = useContext(ActingAs)[0];

  const [isLoading, setIsLoading] = useState(false);

  // const filters = useBookingListFilterContext()[0];

  const query = useMemo(
    () => (collection: firebase.firestore.CollectionReference) => {
      setIsLoading(true);
      //TODO add filters at some point
      setIsLoading(false);
      return collection.orderBy('createdAt', 'desc');
    },
    [userRecord, actingAs],
  );

  const bookingRequestsSnapshot = useFirestoreCollection('booking-requests', query);
  // const bookingsSnapshot = useFirestoreCollection('bookings', userRecord && !actingAs ? query : null);

  const bookingRequestsResult = useMemo(() => {
    setIsLoading(false);
    const bookingRequests = bookingRequestsSnapshot?.docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data(),
      } as BookingRequest;
    }) as BookingRequest[] | undefined;
    console.log('FOUND BOOKING REQUESTS: ', bookingRequests?.length);
    return normalizeBookingRequests(bookingRequests) as BookingRequest[] | undefined;
  }, [bookingRequestsSnapshot]);

  return (
    <BookingRequestsContext.Provider value={[bookingRequestsResult, isLoading]}>
      {children}
    </BookingRequestsContext.Provider>
  );
};

export default BookingRequestsProvider;
