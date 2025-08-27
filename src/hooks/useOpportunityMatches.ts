import { useMemo } from 'react';

import useFirestoreCollection from './useFirestoreCollection';
import useNormalizedOpportunityMatch from './useNormalizedOpportunityMatch';
import { NormalizedEntityOpportunityMatch } from '../model/Opportunity';

const useEntityOpportunityMatches = (): NormalizedEntityOpportunityMatch[] | undefined => {
  const opportunityMatchSnapshot = useFirestoreCollection('opportunity-matches');
  const normalizeOpportunityMatch = useNormalizedOpportunityMatch();

  return useMemo(() => {
    return opportunityMatchSnapshot?.docs?.map(doc =>
      normalizeOpportunityMatch({ id: doc.id, ...doc.data() }),
    );
  }, [opportunityMatchSnapshot?.docs, normalizeOpportunityMatch]);
};

export default useEntityOpportunityMatches;
