import { useMemo } from 'react';
import firebase from '../firebase';
import useFirestoreCollection from './useFirestoreCollection';
import { flow, update } from 'lodash/fp';
import safeInvoke from '../utilities/safeInvoke';
import Commission from '../model/Commission';
import { useCommissionFilterProviderContext } from '../providers/CommissionFilterProvider';
import { formatCarrierId } from '../components/myDay/MyDayContainer';

export default (bookingId?: string) => {
  const [filters] = useCommissionFilterProviderContext();
  const { carriers, dateRange } = filters;
  const query = useMemo(
    () => (collection: firebase.firestore.Query) => {
      if (bookingId) {
        return collection.where('bookingId', '==', bookingId);
      }
      let query = collection;
      if (filters.dateRange?.startDate) {
        query = query.where('dueDate', '>=', filters.dateRange.startDate);
      }
      if (filters.dateRange?.endDate) {
        query = query.where('dueDate', '<=', filters.dateRange.endDate);
      }
      if (carriers && carriers.length > 0) {
        query = query.where(
          'carrier',
          'in',
          carriers.map(carrier => formatCarrierId(carrier.id)),
        );
      }
      if (dateRange) {
        query = filters.dateRange
          ? query.orderBy('dueDate', 'asc')
          : query.orderBy('payDate', 'asc');
      }
      return query;
    },
    [bookingId, filters.dateRange, carriers, dateRange],
  );

  const paymentCollection = useFirestoreCollection('commission', query);
  return paymentCollection?.docs.map(doc => {
    return { id: doc.id, ...normalizeCommissionData(doc.data()) } as Commission;
  }) as Commission[];
};

export const normalizeCommissionData = (item: any) =>
  flow(
    update('dueDate', safeInvoke('toDate')),
    update('invDate', safeInvoke('toDate')),
    update('payDate', safeInvoke('toDate')),
  )(item);
