import { useCallback } from 'react';

import useFirestoreCollection from './useFirestoreCollection';
import LoadListContainerModel from '../model/LoadListContainerModel';
import subDays from 'date-fns/subDays';

export default function useContainers() {
  const query = useCallback(
    q =>
      q
        .where('ets', '>=', subDays(new Date(), 1))
        .orderBy('ets', 'asc')
        .orderBy('bookingId', 'asc'),
    [],
  );

  const containersCollection = useFirestoreCollection('containers', query);

  return containersCollection?.docs.map(doc => {
    return doc.data() as LoadListContainerModel;
  }) as LoadListContainerModel[];
}
