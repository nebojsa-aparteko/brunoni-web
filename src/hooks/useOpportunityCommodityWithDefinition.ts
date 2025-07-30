import { useMemo } from 'react';
import { OpportunityCommodityGroup } from '../model/OpportunityCommodityGroup';
import useFirestoreCollection from './useFirestoreCollection';
import { OpportunityMatchDefinition } from '../model/Opportunity';

const useOpportunityCommodityGroups = ():
  | {
      definition: OpportunityMatchDefinition<'groupId' | 'freeText'>;
      value: OpportunityCommodityGroup | string;
    }[]
  | undefined => {
  const commodityGroupsCollection = useFirestoreCollection('opportunity-commodity-groups');

  return useMemo(() => {
    if (!commodityGroupsCollection) return undefined;

    const commodityCollection = commodityGroupsCollection.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as OpportunityCommodityGroup[];

    const commodityGroups = commodityCollection.map(group => ({
      definition: { type: 'groupId' as const, value: group.id },
      value: group,
    }));

    const commodityFreeText = commodityCollection.reduce(
      (acc, group) =>
        acc.concat(
          (group.commodities || []).map((commodity: string) => ({
            definition: { type: 'freeText' as const, value: commodity },
            value: commodity,
          })),
        ),
      [] as { definition: OpportunityMatchDefinition<'freeText'>; value: string }[],
    );

    return [...commodityGroups, ...commodityFreeText];
  }, [commodityGroupsCollection]);
};

export default useOpportunityCommodityGroups;
