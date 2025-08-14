import { useMemo } from 'react';
import { OpportunityPlacesGroup } from '../model/OpportunityPlacesGroup';
import useFirestoreCollection from './useFirestoreCollection';

const useOpportunityPlacesGroups = (): OpportunityPlacesGroup[] | undefined => {
  const placesGroupsCollection = useFirestoreCollection('opportunity-places-groups');

  return useMemo(
    () =>
      placesGroupsCollection?.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as OpportunityPlacesGroup[],
    [placesGroupsCollection],
  );
};

export default useOpportunityPlacesGroups;
