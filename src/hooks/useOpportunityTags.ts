import { useMemo } from 'react';
import { OpportunityTag } from '../model/OpportunityTag';
import useFirestoreCollection from './useFirestoreCollection';

const useOpportunityTags = (): OpportunityTag[] | undefined => {
  const opportunityTagsCollection = useFirestoreCollection('opportunity-tags');

  return useMemo(
    () =>
      opportunityTagsCollection?.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as OpportunityTag[],
    [opportunityTagsCollection],
  );
};

export default useOpportunityTags;
