import React, { createContext, useMemo, useReducer } from 'react';
import BookingsContext from '../contexts/Bookings';
import useUser from '../hooks/useUser';
import useFirestoreCollection from '../hooks/useFirestoreCollection';
import { Booking } from '../model/Booking';
import map from 'lodash/fp/map';
import flow from 'lodash/fp/flow';
import update from 'lodash/fp/update';
import invoke from 'lodash/fp/invoke';
import set from 'lodash/fp/set';
import { DateRange } from '../components/DateRangePicker/types';

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
type FilterFields = 'dateRange' | 'archived';
type State = { dateRange?: DateRange; archived?: boolean };

type Action = {
  type: ActionType;
  field: FilterFields;
  value: DateRange | boolean | undefined;
};

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'set':
      return set(action.field, action.value)(state);
    case 'clear':
      return set(action.field, undefined)(state);
    default:
      return state;
  }
};

const BookingFilterDispatchContext = createContext<Dispatch | undefined>(undefined);

export const useBookingsFilterDispatch = () => {
  const context = React.useContext(BookingFilterDispatchContext);
  if (context === undefined) {
    throw new Error('useBookingsFilterDispatch must be used within a BookingsProvider');
  }
  return context;
};

const BookingsProvider: React.FC<Props> = ({ children }) => {
  const [filters, dispatch] = useReducer(reducer, { archived: false });
  const userRecord = useUser()[1];

  const query = useMemo(
    () => (collection: firebase.firestore.CollectionReference) => {
      let query = collection.orderBy('updatedAt', 'desc');
      if (userRecord?.alphacomClientId) {
        query = query.where('ForwAdrId', '==', userRecord!.alphacomClientId);
      }
      if (filters.archived) {
        query = query.where('archived', '==', filters.archived);
      }
      if (filters.dateRange?.startDate) {
        query = query.where('createdAt', '>=', filters.dateRange.startDate);
      }
      if (filters.dateRange?.endDate) {
        query = query.where('createdAt', '<=', filters.dateRange.endDate);
      }
      return query;
    },
    [userRecord, filters],
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
    <BookingsContext.Provider value={bookingsResult}>
      <BookingFilterDispatchContext.Provider value={dispatch}>{children}</BookingFilterDispatchContext.Provider>
    </BookingsContext.Provider>
  );
};

export default BookingsProvider;
