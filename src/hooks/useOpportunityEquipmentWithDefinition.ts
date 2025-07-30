import { useMemo } from 'react';
import { OpportunityEquipmentGroup } from '../model/OpportunityEquipmentGroup';
import ContainerType from '../model/ContainerType';
import useFirestoreCollection from './useFirestoreCollection';
import { OpportunityMatchDefinition } from '../model/Opportunity';

const useOpportunityEquipmentWithDefinition = (): {
  definition: OpportunityMatchDefinition<'groupId' | 'containerTypeId'>;
  value: OpportunityEquipmentGroup | ContainerType;
}[] => {
  const equipmentGroupsCollection = useFirestoreCollection('opportunity-equipments-groups');
  const containerTypesCollection = useFirestoreCollection('container-types');

  return useMemo(() => {
    const equipmentGroups =
      equipmentGroupsCollection?.docs.map(doc => ({
        definition: { type: 'groupId', value: doc.id } as OpportunityMatchDefinition<'groupId'>,
        value: { id: doc.id, ...doc.data() } as OpportunityEquipmentGroup,
      })) || [];

    const containerTypes =
      containerTypesCollection?.docs.map(doc => ({
        definition: {
          type: 'containerTypeId',
          value: doc.id,
        } as OpportunityMatchDefinition<'containerTypeId'>,
        value: { id: doc.id, ...doc.data() } as ContainerType,
      })) || [];

    return [...equipmentGroups, ...containerTypes];
  }, [equipmentGroupsCollection, containerTypesCollection]);
};

export default useOpportunityEquipmentWithDefinition;
