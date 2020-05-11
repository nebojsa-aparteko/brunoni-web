import React, { createContext, Reducer, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import useUser from '../hooks/useUser';
import useFirestoreCollection from '../hooks/useFirestoreCollection';
import { Booking, BookingCategory } from '../model/Booking';
import map from 'lodash/fp/map';
import flow from 'lodash/fp/flow';
import update from 'lodash/fp/update';
import invoke from 'lodash/fp/invoke';
import pick from 'lodash/fp/pick';
import isEqual from 'lodash/fp/isEqual';
import ActingAs from '../contexts/ActingAs';
import { Action, ContextFilters, reducer } from './filterActions';
import { UserRecordMinProperties } from '../model/UserRecord';

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

export type BookingsDispatch = (action: Action) => void;

export interface BookingContextFilters extends ContextFilters {
  category: string;
}

const defaultFilters = { archived: false, category: BookingCategory.Export } as BookingContextFilters;

const BookingsContext = createContext<
  [Booking[], boolean, BookingContextFilters] | [undefined, boolean, BookingContextFilters]
>([undefined, true, defaultFilters]);
const BookingsFilterDispatchContext = createContext<BookingsDispatch | undefined>(undefined);

export const useBookingsContext = () => {
  const context = React.useContext(BookingsContext);
  if (context === undefined) {
    throw new Error('useBookingsContext must be used within a BookingsProvider');
  }
  return context;
};

export const useBookingsFilterDispatch = () => {
  const context = React.useContext(BookingsFilterDispatchContext);
  if (context === undefined) {
    throw new Error('useBookingsFilterDispatch must be used within a BookingsProvider');
  }
  return context;
};

const BookingsProvider: React.FC<Props> = ({ children }) => {
  const userRecord = useUser()[1];
  const actingAs = useContext(ActingAs)[0];

  const [isLoading, setIsLoading] = useState(false);

  const [filters, dispatch] = useReducer<Reducer<BookingContextFilters, Action>>(reducer, {
    archived: false,
    category: BookingCategory.Export,
    pendingPayment: false,
    assignee: !actingAs && userRecord,
  } as BookingContextFilters);

  const [filtersPreviousVal, setFiltersPreviousVal] = useState<BookingContextFilters | undefined>(undefined);

  const query = useMemo(
    () => (collection: firebase.firestore.CollectionReference) => {
      if (
        !isEqual(pick(['archived', 'category', 'pendingPayment'])(filtersPreviousVal))(
          pick(['archived', 'category', 'pendingPayment'])(filters),
        )
      ) {
        // show loading only if there is a change in these filters
        setIsLoading(true);
      }

      setFiltersPreviousVal(filters); // store previous value for future passes

      let query = collection.where('Category', '==', filters.category);

      if (actingAs && userRecord?.alphacomClientId) {
        query = query.where('ForwAdrId', '==', userRecord!.alphacomClientId);
      }

      // admins have different filters, clients should default to seeing all
      if (!actingAs) {
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

  return (
    <BookingsContext.Provider value={[bookingsResult, isLoading, filters]}>
      <BookingsFilterDispatchContext.Provider value={dispatch}>{children}</BookingsFilterDispatchContext.Provider>
    </BookingsContext.Provider>
  );
};

export default BookingsProvider;
