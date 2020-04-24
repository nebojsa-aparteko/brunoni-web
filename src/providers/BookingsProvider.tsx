import React, { createContext, useContext, useMemo, useReducer } from 'react';
import useUser from '../hooks/useUser';
import useFirestoreCollection from '../hooks/useFirestoreCollection';
import { Booking, BookingCategory } from '../model/Booking';
import map from 'lodash/fp/map';
import flow from 'lodash/fp/flow';
import update from 'lodash/fp/update';
import invoke from 'lodash/fp/invoke';
import set from 'lodash/fp/set';
import { DateRange } from '../components/daterangepicker/types';
import ActingAs from '../contexts/ActingAs';
import Client from '../model/Client';
import Port from '../model/Port';
import UserRecord from '../model/UserRecord';

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

type Dispatch = (action: Action) => void;
type ActionType = 'set' | 'clear';
type FilterFields =
  | 'dateRange'
  | 'archived'
  | 'category'
  | 'pendingPayment'
  | 'assignee'
  | 'originPort'
  | 'destinationPort'
  | 'clientFilter';

// filters by which we can filter bookings
export type BookingContextFilters = {
  dateRange?: DateRange;
  archived?: boolean;
  category: string;
  pendingPayment?: boolean;
  assignee?: UserRecord;
  clientFilter?: Client;
  originPort?: Port;
  destinationPort?: Port;
};

type Action = {
  type: ActionType;
  field: FilterFields;
  value?: DateRange | boolean | string | undefined | Port | Client | UserRecord;
};

const reducer = (state: BookingContextFilters, action: Action) => {
  switch (action.type) {
    case 'set':
      return set(action.field, action.value)(state);
    case 'clear':
      return set(action.field, undefined)(state);
    default:
      return state;
  }
};

const defaultFilters = { archived: false, category: BookingCategory.Export } as BookingContextFilters;

const BookingsContext = createContext<[Booking[], BookingContextFilters] | [undefined, BookingContextFilters]>([
  undefined,
  defaultFilters,
]);
const BookingsFilterDispatchContext = createContext<Dispatch | undefined>(undefined);

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

  const [filters, dispatch] = useReducer(reducer, { archived: false, category: BookingCategory.Export });

  // in case of admins set assignee filter automatically
  // TODO activate this when it starts having sense :)
  // useEffect(() => {
  //   if (userRecord && userRecord.isAdmin && !actingAs && dispatch) {
  //     dispatch({type: 'set', field: 'assignee', value: userRecord})
  //   }
  // }, [userRecord, actingAs, dispatch]);

  const query = useMemo(
    () => (collection: firebase.firestore.CollectionReference) => {
      let query = filters.dateRange
        ? collection.orderBy('createdAt', 'desc').orderBy('updatedAt', 'desc')
        : collection.orderBy('updatedAt', 'desc');

      if (actingAs && userRecord?.alphacomClientId) {
        query = query.where('ForwAdrId', '==', userRecord!.alphacomClientId);
      }

      // admins have different filters, clients should default to seeing all
      if (!actingAs) {
        query = query.where('archived', '==', filters.archived);
      }

      query = query.where('Category', '==', filters.category);

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
        query = query.where('BkgAgentContact', '==', filters.assignee.alphacomId);
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

      return query;
    },
    [userRecord, filters, actingAs],
  );

  const bookingsSnapshot = useFirestoreCollection('bookings', query);

  const bookingsResult = useMemo(() => {
    const bookings = bookingsSnapshot?.docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data(),
      } as Booking;
    }) as Booking[] | undefined;

    return normalizeBookings(bookings);
  }, [userRecord, bookingsSnapshot, filters]);

  return (
    <BookingsContext.Provider value={[bookingsResult, filters]}>
      <BookingsFilterDispatchContext.Provider value={dispatch}>{children}</BookingsFilterDispatchContext.Provider>
    </BookingsContext.Provider>
  );
};

export default BookingsProvider;
