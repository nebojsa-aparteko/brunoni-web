import React, { createContext, useMemo, useState } from 'react';
import useFirestoreCollection from '../hooks/useFirestoreCollection';
import map from 'lodash/fp/map';
import flow from 'lodash/fp/flow';
import update from 'lodash/fp/update';
import invoke from 'lodash/fp/invoke';
import firebase from '../firebase';
import { BookingRequest } from '../model/BookingRequest';
import safeInvoke from '../utilities/safeInvoke';
import { useBookingRequestsFilterContext } from './BookingRequestsFilterProvider';

interface Props {
  children: React.ReactNode;
}

export const normalizeBookingRequest = flow(
  update('createdAt', invoke('toDate')),
  update('updatedAt', invoke('toDate')),
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
  const [isLoading, setIsLoading] = useState(false);

  const filters = useBookingRequestsFilterContext()[0];

  const query = useMemo(
    () => (collection: firebase.firestore.Query) => {
      setIsLoading(true);
      let query = collection;
      query = query.where('hold', '==', filters.hold);
      if (filters.minStatusCode) {
        query = query.where('statusCode', '>=', filters.minStatusCode.valueOf());
      }
      if (filters.maxStatusCode) {
        query = query.where('statusCode', '<=', filters.maxStatusCode);
      }
      if (filters.carrier) {
        query = query.where('carrier.id', '==', filters.carrier.id);
      }
      if (filters.clientFilter) {
        query = query.where('client.id', '==', filters.clientFilter.id);
      }
      if (filters.originPort) {
        query = query.where('origin.id', '==', filters.originPort.id);
      }
      if (filters.destinationPort) {
        query = query.where('destination.id', '==', filters.destinationPort.id);
      }
      if (filters.assignee?.alphacomId) {
        query = query.where('assignedUser.alphacomId', '==', filters.assignee.alphacomId);
      }
      if (filters.assignedTags && filters.assignedTags.length > 0) {
        query = query.where('assignedTags', 'array-contains-any', filters.assignedTags);
      }
      return query.orderBy('statusCode', 'desc').orderBy('createdAt', 'desc');
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
    <BookingRequestsContext.Provider value={[bookingRequestsResult, isLoading]}>
      {children}
    </BookingRequestsContext.Provider>
  );
};

export default BookingRequestsProvider;
