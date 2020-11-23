import { useMemo } from 'react';
import firebase from '../firebase';
import useFirestoreCollection from './useFirestoreCollection';
import { flow, update } from 'lodash/fp';
import safeInvoke from '../utilities/safeInvoke';
import Commission from '../model/Commission';
import { useCommissionFilterProviderContext } from '../providers/CommissionFilterProvider';

export default (bookingId?: string) => {
  const [filters] = useCommissionFilterProviderContext();
  const { carrier, dueDate } = filters;

  const query = useMemo(
    () => (collection: firebase.firestore.Query) => {
      if (bookingId) {
        return collection.where('bookingId', '==', bookingId);
      }
      let query = collection.orderBy('bookingId', 'asc').limit(100);
      if (dueDate) {
        query = query.where('dueDate', '==', dueDate);
      }
      if (carrier) {
        query = query.where(
          'carrier',
          '==',
          carrier.id === 'HSG' ? 'Hamburg Süd' : carrier.id === 'SLOM' ? 'SLOMAN NEPTUN' : carrier.id,
        );
      }
      return query;
    },
    [dueDate, carrier, bookingId],
  );

  const paymentCollection = useFirestoreCollection('commission', query);
  return paymentCollection?.docs.map(doc => {
    return { id: doc.id, ...normalizeCommissionData(doc.data()) } as Commission;
  }) as Commission[];
};

const normalizeCommissionData = (item: any) =>
  flow(
    update('dueDate', safeInvoke('toDate')),
    update('invDate', safeInvoke('toDate')),
    update('payDate', safeInvoke('toDate')),
  )(item);
