import { useMemo } from 'react';
import { OpportunityCommodityGroup } from '../model/OpportunityCommodityGroup';
import useFirestoreCollection from './useFirestoreCollection';

const useOpportunityCommodityGroups = (): OpportunityCommodityGroup[] | undefined => {
  const commodityGroupsCollection = useFirestoreCollection('opportunity-commodity-groups');

  return useMemo(
    () =>
      commodityGroupsCollection?.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as OpportunityCommodityGroup[],
    [commodityGroupsCollection],
  );
};

export default useOpportunityCommodityGroups;
