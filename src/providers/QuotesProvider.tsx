import React, { createContext, useContext, useMemo, useReducer } from 'react';
import useUser from '../hooks/useUser';
import ActingAs from '../contexts/ActingAs';
import { Action, ContextFilters, reducer } from './filterActions';
import { Booking, BookingCategory } from '../model/Booking';
import useFirestoreCollection from '../hooks/useFirestoreCollection';
import { normalizeBookings } from './BookingsProvider';
import { Quote } from './QuoteGroupsProvider';
import { subMonths } from 'date-fns';

interface Props {
  children: React.ReactNode;
}

export type QuoteDispatch = (action: Action) => void;

interface QuoteContextFilters extends ContextFilters {}

const defaultFilters = {
  dateRange: { startDate: subMonths(new Date(), 2), endDate: new Date() },
} as QuoteContextFilters;

export const QuotesContext = createContext<[Quote[], QuoteContextFilters] | [undefined, QuoteContextFilters]>([
  undefined,
  defaultFilters,
]);

const QuotesFilterDispatchContext = createContext<QuoteDispatch | undefined>(undefined);

const QuotesProvider: React.FC<Props> = ({ children }) => {
  const userRecord = useUser()[1];
  const actingAs = useContext(ActingAs)[0];

  const [filters, dispatch] = useReducer(reducer, defaultFilters);

  // in case of admins set assignee filter automatically
  // TODO activate this when it starts having sense :)
  // useEffect(() => {
  //   if (userRecord && userRecord.isAdmin && !actingAs && dispatch) {
  //     dispatch({type: 'set', field: 'assignee', value: userRecord})
  //   }
  // }, [userRecord, actingAs, dispatch]);

  const query = useMemo(
    () => (collection: firebase.firestore.CollectionReference) => {
      let query = collection.orderBy('dateIssued', 'desc');

      if (actingAs && userRecord?.alphacomClientId) {
        query = query.where('clientId', '==', userRecord!.alphacomClientId);
      }

      // admins have different filters, clients should default to seeing all
      // TODO add archived when ready
      // if (!actingAs) {
      //   query = query.where('archived', '==', filters.archived);
      // }

      if (filters.dateRange?.startDate) {
        query = query.where('dateIssued', '>=', filters.dateRange.startDate);
      }
      if (filters.dateRange?.endDate) {
        query = query.where('dateIssued', '<=', filters.dateRange.endDate);
      }

      if (filters.assignee) {
        const splituserId = filters.assignee.alphacomId.split('-');
        const normalizedUserId = splituserId[0] + '-' + Number(splituserId[1]);
        query = query.where('assignee', '==', normalizedUserId);
      }

      if (filters.originPort) {
        query = query.where('origin', '==', filters.originPort.id);
      }

      if (filters.destinationPort) {
        query = query.where('destination', '==', filters.destinationPort.id);
      }

      if (filters.clientFilter) {
        query = query.where('clientId', '==', filters.clientFilter.id);
      }

      return query;
    },
    [userRecord, filters, actingAs],
  );

  const bookingsSnapshot = useFirestoreCollection('quotes', query);

  const quotesResult = useMemo(() => {
    const bookings = bookingsSnapshot?.docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data(),
      } as Quote;
    }) as Booking[] | undefined;

    return normalizeBookings(bookings);
  }, [bookingsSnapshot]);

  return (
    <QuotesContext.Provider value={[quotesResult, filters]}>
      <QuotesFilterDispatchContext.Provider value={dispatch}>{children}</QuotesFilterDispatchContext.Provider>
    </QuotesContext.Provider>
  );
};

export default QuotesProvider;

export const useQuotesContext = () => {
  const context = React.useContext(QuotesContext);
  if (context === undefined) {
    throw new Error('useQuotesContext must be used within a QuotesProvider');
  }
  return context;
};

export const useQuotesFilterDispatch = () => {
  const context = React.useContext(QuotesFilterDispatchContext);
  if (context === undefined) {
    throw new Error('useQuotesFilterDispatch must be used within a QuotesProvider');
  }
  return context;
};
