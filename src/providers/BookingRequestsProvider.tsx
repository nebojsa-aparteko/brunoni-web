import React, { createContext, useContext, useMemo, useState } from 'react';
import useFirestoreCollection from '../hooks/useFirestoreCollection';
import map from 'lodash/fp/map';
import flow from 'lodash/fp/flow';
import update from 'lodash/fp/update';
import invoke from 'lodash/fp/invoke';
import firebase from '../firebase';
import { BookingRequest, BookingRequestStatusCode } from '../model/BookingRequest';
import safeInvoke from '../utilities/safeInvoke';
import { useBookingRequestsFilterContext } from './BookingRequestsFilterProvider';
import useUser from '../hooks/useUser';
import ActingAs from '../contexts/ActingAs';
import { isSuperAdmin } from '../model/UserRecord';

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
  const [, userRecord] = useUser();
  const filters = useBookingRequestsFilterContext()[0];
  const [actingAs] = useContext(ActingAs);
  const isAdmin = !actingAs;

  const query = useMemo(
    () => (collection: firebase.firestore.Query) => {
      setIsLoading(true);
      let query = collection;
      query = query.where('hold', '==', filters.hold);

      if (actingAs && userRecord?.alphacomClientId) {
        query = query.where('client.id', '==', userRecord!.alphacomClientId);
      }
      // for admin: if user filter is in use, show active bookings that are assigned to the filtered user; otherwise only show unassigned requests
      if (filters.assignee?.alphacomId) {
        query = query.where('assignedUser.alphacomId', '==', filters.assignee.alphacomId);
      } else if (isAdmin && !filters.hold && filters.maxStatusCode === BookingRequestStatusCode.IN_PROGRESS) {
        query = query.where('assignedUser', '==', null);
      }
      if (filters.minStatusCode) {
        query = query.where('statusCode', '>=', filters.minStatusCode.valueOf());
      }
      if (filters.maxStatusCode) {
        query = query.where('statusCode', '<=', filters.maxStatusCode);
      }
      if (filters.carrier) {
        query = query.where('carrier.id', '==', filters.carrier.id);
      } else {
        if (isAdmin && !isSuperAdmin(userRecord) && userRecord.carriers && userRecord.carriers?.length === 1)
          query = query.where('carrier.id', '==', userRecord.carriers[0]);
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
      if (filters.assignedTags && filters.assignedTags.length > 0) {
        query = query.where('assignedTags', 'array-contains-any', filters.assignedTags);
      }
      return query;
    },
    [filters, isAdmin, userRecord.carriers],
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

    const sortFunction = () => {
      return (a: BookingRequest, b: BookingRequest) => {
        if (a.statusCode === b.statusCode) {
          if (!!a.assignedUser === !!b.assignedUser) {
            if (a.itinerary?.placeOfReceipt?.DepartureDate && b.itinerary?.placeOfReceipt?.DepartureDate)
              return a.itinerary.placeOfReceipt.DepartureDate < b.itinerary.placeOfReceipt.DepartureDate ? -1 : 1;
            else if (a.itinerary?.portOfLoading?.DepartureDate && b.itinerary?.portOfLoading?.DepartureDate)
              return a.itinerary?.portOfLoading?.DepartureDate < b.itinerary?.portOfLoading?.DepartureDate ? -1 : 1;
            return a.itinerary?.placeOfReceipt
              ? a.itinerary?.placeOfReceipt?.DepartureDate
                ? -1
                : 1
              : a.itinerary?.portOfLoading?.DepartureDate
              ? -1
              : 1;
          } else {
            return a.assignedUser === null ? -1 : 1;
          }
        }
        return a.statusCode < b.statusCode ? -1 : 1;
      };
    };

    return normalizeBookingRequests(bookingRequests).sort(sortFunction()) as BookingRequest[];
  }, [bookingRequestsSnapshot]);

  return (
    <BookingRequestsContext.Provider value={[bookingRequestsResult, isLoading]}>
      {children}
    </BookingRequestsContext.Provider>
  );
};

export default BookingRequestsProvider;
