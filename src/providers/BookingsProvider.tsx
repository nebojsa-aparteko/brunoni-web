import React, { createContext, Dispatch, SetStateAction, useContext, useMemo, useState } from 'react';
import useUser from '../hooks/useUser';
import useFirestoreCollection from '../hooks/useFirestoreCollection';
import { Booking } from '../model/Booking';
import map from 'lodash/fp/map';
import flow from 'lodash/fp/flow';
import update from 'lodash/fp/update';
import invoke from 'lodash/fp/invoke';
import pick from 'lodash/fp/pick';
import ActingAs from '../contexts/ActingAs';
import { ContextFilters } from './filterActions';
import { UserRecordMinProperties } from '../model/UserRecord';
import { useBookingListFilterContext } from './BookingListFilterProvider';
import firebase from '../firebase';

interface Props {
  children: React.ReactNode;
}

export const normalizeBooking = flow(
  update('createdAt', invoke('toDate')),
  update('updatedAt', invoke('toDate')),
  update('TimeStamp', invoke('toDate')),
  update('PlaceOfReceiptETS', invoke('toDate')),
  update('FinalDestinationETA', invoke('toDate')),
  update('ETS', invoke('toDate')),
  update('ETA', invoke('toDate')),
);

export const normalizeBookings = map(normalizeBooking);

export type BookingsDispatch = Dispatch<SetStateAction<BookingContextFilters>>;

export interface BookingContextFilters extends ContextFilters {
  category: string;
}

const BookingsContext = createContext<[Booking[] | undefined, boolean]>([undefined, true]);

export const useBookingsContext = () => {
  const context = React.useContext(BookingsContext);
  if (context === undefined) {
    throw new Error('useBookingsContext must be used within a BookingsProvider');
  }
  return context;
};

const BookingsProvider: React.FC<Props> = ({ children }) => {
  const userRecord = useUser()[1];
  const actingAs = useContext(ActingAs)[0];

  const [isLoading, setIsLoading] = useState(false);

  const filters = useBookingListFilterContext()[0];

  const query = useMemo(
    () => (collection: firebase.firestore.CollectionReference) => {
      setIsLoading(true);

      let query = collection.where('Category', '==', filters.category);

      if (actingAs && userRecord?.alphacomClientId) {
        query = query.where('ForwAdrId', '==', userRecord!.alphacomClientId);
      }

      // admins have different filters, clients should default to seeing all
      if (!actingAs) {
        query = query.where('archived', '==', filters.archived);
      }

      if (filters.archived !== undefined && actingAs) {
        query = query.where('archived', '==', filters.archived);
      }

      if (filters.pendingPayment !== undefined) {
        query = query.where('pendingPayment', '==', filters.pendingPayment);
      }

      if (filters.dateRange?.startDate) {
        query = query.where('createdAt', '>=', filters.dateRange.startDate);
      }
      if (filters.dateRange?.endDate) {
        query = query.where('createdAt', '<=', filters.dateRange.endDate);
      }

      if (filters.assignee) {
        query = query.where('watchers', 'array-contains', pick(UserRecordMinProperties)(filters.assignee));
      }

      if (filters.carrier) {
        query = query.where(
          'CarrierID',
          '==',
          filters.carrier.id === 'HSG'
            ? 'Hamburg Süd'
            : filters.carrier.id === 'SLOM'
            ? 'SLOMAN NEPTUN'
            : filters.carrier.id,
        );
      }

      if (filters.originPort) {
        query = query.where('POL', '==', filters.originPort.id);
      }

      if (filters.destinationPort) {
        query = query.where('POD', '==', filters.destinationPort.id);
      }

      if (filters.clientFilter) {
        query = query.where('ForwAdrId', '==', filters.clientFilter.id);
      }

      query = filters.dateRange
        ? query.orderBy('createdAt', 'desc').orderBy('updatedAt', 'desc')
        : query.orderBy('updatedAt', 'desc');

      return query;
    },
    [userRecord, filters, actingAs],
  );

  const bookingsSnapshot = useFirestoreCollection('bookings', query);
  // const bookingsSnapshot = useFirestoreCollection('bookings', userRecord && !actingAs ? query : null);

  const bookingsResult = useMemo(() => {
    setIsLoading(false);
    const bookings = bookingsSnapshot?.docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data(),
      } as Booking;
    }) as Booking[] | undefined;
    return normalizeBookings(bookings);
  }, [bookingsSnapshot]);

  return <BookingsContext.Provider value={[bookingsResult, isLoading]}>{children}</BookingsContext.Provider>;
};

export default BookingsProvider;
