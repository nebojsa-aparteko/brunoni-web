import { useMemo } from 'react';

import useFirestoreCollection from './useFirestoreCollection';
import LoadListContainerModel from '../model/LoadListContainerModel';
import firebase from '../firebase';
import { useLoadListFilterContext } from '../providers/LoadListFilterProvider';
import { BookingCategory, BookingVersion } from '../model/Booking';

export default function useContainers(q?: () => any) {
  const [filters, _] = useLoadListFilterContext();
  const { origin, carrier, dateRange } = filters;
  const query = useMemo(
    () => (collection: firebase.firestore.Query) => {
      // setIsLoading(true);
      let query = collection
        .where('ets', '>=', dateRange?.startDate || new Date())
        .where('ets', '<=', dateRange?.endDate || new Date())
        .where('category', '==', BookingCategory.Export)
        .where('version', '==', BookingVersion.long);

      if (origin) {
        query = query.where('pol', '==', origin.id);
      }

      if (carrier) {
        query = query.where(
          'carrierId',
          '==',
          carrier.id === 'HSG' ? 'Hamburg Süd' : carrier.id === 'SLOM' ? 'SLOMAN NEPTUN' : carrier.id,
        );
      }
      query = query.orderBy('ets', 'asc').orderBy('bookingId', 'asc');
      return query;
    },
    [carrier, filters],
  );

  // const query = useCallback(
  //   q =>
  //     q
  //       .where('category', '==', BookingCategory.Export)
  //       .where('ets', '>=', subDays(new Date(), 1))
  //       .orderBy('ets', 'asc')
  //       .orderBy('bookingId', 'asc'),
  //   [],
  // );

  const containersCollection = useFirestoreCollection('containers', q || query);

  return containersCollection?.docs.map(doc => {
    return doc.data() as LoadListContainerModel;
  }) as LoadListContainerModel[];
}
