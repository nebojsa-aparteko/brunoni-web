import React, { createContext, Dispatch, SetStateAction, useMemo, useState } from 'react';
import useFirestoreCollection from '../hooks/useFirestoreCollection';
import map from 'lodash/fp/map';
import flow from 'lodash/fp/flow';
import update from 'lodash/fp/update';
import invoke from 'lodash/fp/invoke';
import firebase from '../firebase';
import { BookingRequest } from '../model/BookingRequest';
import safeInvoke from '../utilities/safeInvoke';
import { ContextFilters } from './filterActions';
import Carrier from '../model/Carrier';

interface Props {
  children: React.ReactNode;
}

export const normalizeBookingRequest = flow(
  update('createdAt', invoke('toDate')),
  update('containers', flow(map(flow(update('pickupDate', safeInvoke('toDate')))))),
);

export const normalizeBookingRequests = map(normalizeBookingRequest);
interface BookingRequestFilters extends ContextFilters {
  carrier?: Carrier | undefined;
}

const BookingRequestsContext = createContext<
  [BookingRequest[] | undefined, boolean, BookingRequestFilters, Dispatch<SetStateAction<BookingRequestFilters>>]
>([undefined, true, {}, () => {}]);

export const useBookingRequestsContext = () => {
  const context = React.useContext(BookingRequestsContext);
  if (context === undefined) {
    throw new Error('useBookingsContext must be used within a BookingsProvider');
  }
  return context;
};

const BookingRequestsProvider: React.FC<Props> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<BookingRequestFilters>({});

  const query = useMemo(
    () => (collection: firebase.firestore.Query) => {
      setIsLoading(true);
      let query = collection;
      //console.log(filters.archived);
      if (filters.archived) {
        query = query.where('archived', '==', filters.archived);
      }
      if (filters.carrier) {
        query = query.where('carrier.id', '==', filters.carrier.id);
      }
      if (filters.originPort) {
        query = query.where('origin.id', '==', filters.originPort.id);
      }
      if (filters.destinationPort) {
        query = query.where('destination.id', '==', filters.destinationPort.id);
      }
      return query.orderBy('createdAt', 'desc');
    },
    [filters],
  );

  const bookingRequestsSnapshot = useFirestoreCollection('bookings-requests', query);

  const bookingRequestsResult = useMemo(() => {
    const bookingRequests = bookingRequestsSnapshot?.docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data(),
      } as BookingRequest;
    }) as BookingRequest[] | undefined;
    setIsLoading(false);
    return normalizeBookingRequests(bookingRequests) as BookingRequest[] | undefined;
  }, [bookingRequestsSnapshot]);

  return (
    <BookingRequestsContext.Provider value={[bookingRequestsResult, isLoading, filters, setFilters]}>
      {children}
    </BookingRequestsContext.Provider>
  );
};

export default BookingRequestsProvider;
