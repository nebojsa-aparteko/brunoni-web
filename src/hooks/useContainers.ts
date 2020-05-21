import { useCallback } from 'react';

import useFirestoreCollection from './useFirestoreCollection';
import LoadListContainerModel from '../model/LoadListContainerModel';
import subDays from 'date-fns/subDays';
import { BookingCategory } from '../model/Booking';

export default function useContainers(q?: () => any) {
  const query = useCallback(
    q =>
      q
        .where('category', '==', BookingCategory.Export)
        .where('ets', '>=', subDays(new Date(), 1))
        .orderBy('ets', 'asc')
        .orderBy('bookingId', 'asc'),
    [],
  );

  const containersCollection = useFirestoreCollection('containers', q || query);

  return containersCollection?.docs.map(doc => {
    return doc.data() as LoadListContainerModel;
  }) as LoadListContainerModel[];
}
