import { useCallback } from 'react';

import useFirestoreCollection from './useFirestoreCollection';
import LoadListContainerModel from '../model/LoadListContainerModel';

export default function useContainers() {
  const query = useCallback(q => q.orderBy('ets', 'desc'), []);

  const teamsCollection = useFirestoreCollection('containers', query);

  return teamsCollection?.docs.map(doc => {
    return { id: doc.id, ...doc.data() } as LoadListContainerModel;
  }) as LoadListContainerModel[];
}
