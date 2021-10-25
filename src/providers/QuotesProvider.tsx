import React, { createContext, Dispatch, SetStateAction, useContext, useEffect, useMemo, useState } from 'react';
import useUser from '../hooks/useUser';
import ActingAs from '../contexts/ActingAs';
import { ContextFilters } from './filterActions';
import useFirestoreCollection from '../hooks/useFirestoreCollection';
import { Quote } from './QuoteGroupsProvider';
import Carrier from '../model/Carrier';
import firebase from '../firebase';
import { isNumberOfAppliedFiltersLessThan } from '../utilities/isNumberOfAppliedFiltersLessThan';
import Carriers from '../contexts/Carriers';
import { isSuperAdmin } from '../model/UserRecord';

interface Props {
  children: React.ReactNode;
}

interface QuoteContextFilters extends ContextFilters {
  carrier?: Carrier;
}

const defaultFilters = {} as QuoteContextFilters;

export const QuotesContext = createContext<
  [Quote[] | undefined, boolean, QuoteContextFilters, Dispatch<SetStateAction<QuoteContextFilters>> | undefined]
>([undefined, true, defaultFilters, undefined]);

const QuotesProvider: React.FC<Props> = ({ children }) => {
  const userRecord = useUser()[1];
  const actingAs = useContext(ActingAs)[0];
  const carriers = useContext(Carriers);

  const [isLoading, setIsLoading] = useState(false);

  const [filters, setFilters] = useState<QuoteContextFilters>(defaultFilters);
  const [availableCarriers, setAvailableCarriers] = useState(
    carriers && userRecord.carriers
      ? userRecord.carriers?.map(carrierId => carriers?.find(carrier => carrierId && carrier.id === carrierId)?.name)
      : [],
  );

  const [filtersPreviousVal, setFiltersPreviousVal] = useState<QuoteContextFilters | undefined>(undefined);

  useEffect(() => {
    setAvailableCarriers(
      carriers && userRecord.carriers
        ? userRecord.carriers?.map(carrierId => carriers?.find(carrier => carrierId && carrier.id === carrierId)?.name)
        : [],
    );
  }, [carriers, userRecord]);

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
        query = collection.where('clientId', '==', userRecord!.alphacomClientId);
      }
      if (!!availableCarriers && availableCarriers.length > 0 && !isSuperAdmin(userRecord)) {
        query = (query || collection).where('carrier', 'in', availableCarriers);
      }

      if (filters.archived) {
        // query = (query || collection).where('archived', '==', filters.archived);
      }

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

      if (filters.carrier) {
        query = (query || collection).where('carrier', '==', filters.carrier.name);
      }

      query = filters.dateRange
        ? (query || collection)
            .where('dateIssued', '>=', filters.dateRange.startDate)
            .where('dateIssued', '<=', filters.dateRange.endDate)
            .orderBy('dateIssued', 'desc')
        : // active quotes, filter the ones that are not archived and validity is still valid
          (query || collection)
            // .where('validityPeriod.to', '>=', subWeeks(new Date(), 1))
            .orderBy('dateIssued', 'desc')
            .orderBy('validityPeriod.to', 'desc');

      const watchingFilters = ['clientFilter', 'originPort', 'destinationPort', 'carrier'];
      if (isNumberOfAppliedFiltersLessThan(filters, watchingFilters, 2)) {
        query = query.limit(isSuperAdmin(userRecord) ? 300 : 100);
      }

      return query;
    },
    [userRecord, filters, actingAs, filtersPreviousVal, availableCarriers],
  );

  const quotesSnapshot = useFirestoreCollection('quotes', query);
  // const quotesSnapshot = useFirestoreCollection('quotes', userRecord && actingAs ? query : null);

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
    <QuotesContext.Provider value={[quotesResult, isLoading, filters, setFilters]}>{children}</QuotesContext.Provider>
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
