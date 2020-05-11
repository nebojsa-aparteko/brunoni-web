import React, { createContext, Reducer, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import useUser from '../hooks/useUser';
import ActingAs from '../contexts/ActingAs';
import { Action, ContextFilters, reducer } from './filterActions';
import useFirestoreCollection from '../hooks/useFirestoreCollection';
import { Quote } from './QuoteGroupsProvider';
import { subWeeks } from 'date-fns';

interface Props {
  children: React.ReactNode;
}

export type QuoteDispatch = (action: Action) => void;

interface QuoteContextFilters extends ContextFilters {}

const defaultFilters = {} as QuoteContextFilters;

export const QuotesContext = createContext<
  [Quote[], boolean, QuoteContextFilters] | [undefined, boolean, QuoteContextFilters]
>([undefined, true, defaultFilters]);

const QuotesFilterDispatchContext = createContext<QuoteDispatch | undefined>(undefined);

const QuotesProvider: React.FC<Props> = ({ children }) => {
  const userRecord = useUser()[1];
  const actingAs = useContext(ActingAs)[0];

  const [isLoading, setIsLoading] = useState(false);

  const [filters, dispatch] = useReducer<Reducer<QuoteContextFilters, Action>>(reducer, defaultFilters);

  const [filtersPreviousVal, setFiltersPreviousVal] = useState<QuoteContextFilters | undefined>(undefined);

  // in case of admins set assignee filter automatically
  // TODO activate this when it starts having sense :)
  // useEffect(() => {
  //   if (userRecord && userRecord.isAdmin && !actingAs && dispatch) {
  //     dispatch({type: 'set', field: 'assignee', value: userRecord})
  //   }
  // }, [userRecord, actingAs, dispatch]);

  const query = useMemo(
    () => (collection: firebase.firestore.CollectionReference) => {
      if (filtersPreviousVal?.archived !== filters.archived) {
        // show loading only if there is a change in these filters
        setIsLoading(true);
      }

      setFiltersPreviousVal(filters);

      let query = null;

      if (actingAs && userRecord?.alphacomClientId) {
        query = (query || collection).where('clientId', '==', userRecord!.alphacomClientId);
      }

      // admins have different filters, clients should default to seeing all
      // TODO add archived when ready
      // if (!actingAs) {
      //   query = query.where('archived', '==', filters.archived);
      // }

      if (filters.assignee) {
        query = (query || collection).where('assignee', '==', filters.assignee.alphacomId);
      }

      if (filters.originPort) {
        query = (query || collection).where('origin', '==', filters.originPort.id);
      }

      if (filters.destinationPort) {
        query = (query || collection).where('destination', '==', filters.destinationPort.id);
      }

      if (filters.clientFilter) {
        query = (query || collection).where('clientId', '==', filters.clientFilter.id);
      }

      query = filters.dateRange
        ? (query || collection)
            .where('dateIssued', '>=', filters.dateRange.startDate)
            .where('dateIssued', '<=', filters.dateRange.endDate)
            .orderBy('dateIssued', 'desc')
        : // active quotes, filter the ones that are not archived and validity is still valid
          (query || collection)
            .where('validityPeriod.to', '>=', subWeeks(new Date(), 1))
            .orderBy('validityPeriod.to', 'desc');

      return query;
    },
    [userRecord, filters, actingAs],
  );

  const quotesSnapshot = useFirestoreCollection('quotes', query);

  const quotesResult = useMemo(() => {
    setIsLoading(false);
    const quotes = quotesSnapshot?.docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data(),
      } as Quote;
    }) as Quote[] | undefined;

    return quotes as any;
  }, [quotesSnapshot]);

  return (
    <QuotesContext.Provider value={[quotesResult, isLoading, filters]}>
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
