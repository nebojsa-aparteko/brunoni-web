import { useMemo } from 'react';
import { OpportunityPortsGroup } from '../model/OpportunityPortsGroup';
import useFirestoreCollection from './useFirestoreCollection';

const useOpportunityPortsGroups = (): OpportunityPortsGroup[] | undefined => {
  const portsGroupsCollection = useFirestoreCollection('opportunity-ports-groups');

  return useMemo(
    () =>
      portsGroupsCollection?.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as OpportunityPortsGroup[],
    [portsGroupsCollection],
  );
};

export default useOpportunityPortsGroups;
