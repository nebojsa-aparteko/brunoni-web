import { useMemo } from 'react';
import { NormalizedOpportunity } from '../model/Opportunity';
import useFirestoreCollection from './useFirestoreCollection';
import useNormalizedOpportunity from './useNormalizedOpportunity';

const useOpportunitiesWithSalesRep = (): NormalizedOpportunity[] | null => {
  const opportunitySnapshot = useFirestoreCollection('opportunities');
  const opportunityIds = useMemo(() => {
    return opportunitySnapshot?.docs?.map(doc => doc.id) || [];
  }, [opportunitySnapshot?.docs]);

  const normalizeOpportunity = useNormalizedOpportunity(opportunityIds);

  const opportunities: NormalizedOpportunity[] | undefined = useMemo(() => {
    return opportunitySnapshot?.docs?.map(doc =>
      normalizeOpportunity({ id: doc.id, ...doc.data() }),
    );
  }, [opportunitySnapshot?.docs, normalizeOpportunity]);

  return useMemo(() => {
    if (!opportunities) return null;
    return opportunities;
  }, [opportunities]);
};

export default useOpportunitiesWithSalesRep;
