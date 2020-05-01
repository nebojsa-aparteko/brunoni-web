import { useCallback } from 'react';

import useFirestoreCollection from './useFirestoreCollection';
import LoadListContainerModel from '../model/LoadListContainerModel';
import subWeeks from 'date-fns/subWeeks';

export default function useContainers() {
  const query = useCallback(q => q.where('ets', '>=', subWeeks(new Date(), 4)).orderBy('ets', 'asc'), []);

  const containersCollection = useFirestoreCollection('containers', query);

  return containersCollection?.docs.map(doc => {
    return doc.data() as LoadListContainerModel;
  }) as LoadListContainerModel[];
}
