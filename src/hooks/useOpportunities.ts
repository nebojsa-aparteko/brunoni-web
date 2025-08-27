import { useMemo } from 'react';

import useFirestoreCollection from './useFirestoreCollection';
import useNormalizedOpportunity from './useNormalizedOpportunity';
import { NormalizedOpportunity } from '../model/Opportunity';

const useOpportunitiesWithSalesRep = (): NormalizedOpportunity[] | undefined => {
  const opportunitySnapshot = useFirestoreCollection('opportunities');
  const opportunityIds = useMemo(() => {
    return opportunitySnapshot?.docs?.map(doc => doc.id) || [];
  }, [opportunitySnapshot?.docs]);

  const normalizeOpportunity = useNormalizedOpportunity(opportunityIds);

  return useMemo(() => {
    return opportunitySnapshot?.docs?.map(doc =>
      normalizeOpportunity({ id: doc.id, ...doc.data() }),
    );
  }, [opportunitySnapshot?.docs, normalizeOpportunity]);
};

export default useOpportunitiesWithSalesRep;
