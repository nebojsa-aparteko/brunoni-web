import { useMemo } from 'react';
import { OpportunityEquipmentGroup } from '../model/OpportunityEquipmentGroup';
import useFirestoreCollection from './useFirestoreCollection';

const useOpportunityEquipmentGroups = (): OpportunityEquipmentGroup[] | undefined => {
  const equipmentGroupsCollection = useFirestoreCollection('opportunity-equipments-groups');

  return useMemo(
    () =>
      equipmentGroupsCollection?.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as OpportunityEquipmentGroup[],
    [equipmentGroupsCollection],
  );
};

export default useOpportunityEquipmentGroups;
