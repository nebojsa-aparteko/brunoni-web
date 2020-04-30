import { useCallback } from 'react';

import useFirestoreCollection from './useFirestoreCollection';
import LoadListContainerModel from '../model/LoadListContainerModel';
import subWeeks from 'date-fns/subWeeks';

export default function useContainers() {
  const query = useCallback(q => q.where('ets', '>=', subWeeks(new Date(), 2)).orderBy('ets', 'desc'), []);

  const teamsCollection = useFirestoreCollection('containers', query);

  return teamsCollection?.docs.map(doc => {
    return { id: doc.id, ...doc.data() } as LoadListContainerModel;
  }) as LoadListContainerModel[];
}
