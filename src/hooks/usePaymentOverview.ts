import { useMemo } from 'react';
import firebase from '../firebase';
import WeeklyPayment from '../model/WeeklyPayment';
import useFirestoreCollection from './useFirestoreCollection';
import { useWeeklyPaymentFilterProviderContext } from '../providers/WeeklyPaymentFilterProvider';
import { update } from 'lodash/fp';
import safeInvoke from '../utilities/safeInvoke';

export default (bookingId?: string) => {
  const [filters] = useWeeklyPaymentFilterProviderContext();
  const { carrier, paymentDate } = filters;

  const query = useMemo(
    () => (collection: firebase.firestore.Query) => {
      if (bookingId) {
        return collection.where('bookingId', '==', bookingId);
      }
      let query = collection.orderBy('bookingId', 'asc');
      if (paymentDate) {
        query = query.where('payDate', '==', paymentDate);
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
    [paymentDate, carrier, bookingId],
  );

  const paymentCollection = useFirestoreCollection('weeklyPayment', query);
  return paymentCollection?.docs.map(doc => {
    return { id: doc.id, ...normalizePaymentOverview(doc.data()) } as WeeklyPayment;
  }) as WeeklyPayment[];
};

export const normalizePaymentOverview = (item: any) => update('payDate', safeInvoke('toDate'))(item);
