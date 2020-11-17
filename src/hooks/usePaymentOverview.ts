import { useMemo } from 'react';
import firebase from '../firebase';
import WeeklyPayment from '../model/WeeklyPayment';
import useFirestoreCollection from './useFirestoreCollection';
import { useWeeklyPaymentFilterProviderContext } from '../providers/WeeklyPaymentFilterProvider';
import { update } from 'lodash/fp';
import safeInvoke from '../utilities/safeInvoke';
import Commission from '../model/Commission';
import { DebitCredit } from '../model/Payment';

export default (debitCredit?: DebitCredit, bookingId?: string) => {
  const [filters] = useWeeklyPaymentFilterProviderContext();
  const { carrier, paymentDate } = filters;

  const query = useMemo(
    () => (collection: firebase.firestore.Query) => {
      if (bookingId) {
        let query = collection.where('bookingId', '==', bookingId);
        if (debitCredit) {
          query = query.where('debitCredit', '==', debitCredit);
        }
        return query;
      }
      let query = collection.orderBy('bookingId', 'asc').limit(100);
      // let query = collection.where('resolved', '==', false).where('show', '==', true);
      // if (debitCredit) {
      //   query = query.where('debitCredit', '==', debitCredit);
      // }
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
    [paymentDate, carrier, bookingId, debitCredit],
  );

  const paymentCollection = useFirestoreCollection('weeklyPayment', query);
  if (debitCredit === DebitCredit.CREDIT)
    return paymentCollection?.docs.map(doc => {
      return { id: doc.id, ...normalizePaymentOverview(doc.data()) } as Commission;
    }) as Commission[];
  else
    return paymentCollection?.docs.map(doc => {
      return { id: doc.id, ...normalizePaymentOverview(doc.data()) } as WeeklyPayment;
    }) as WeeklyPayment[];
};

export const normalizePaymentOverview = (item: any) => update('payDate', safeInvoke('toDate'))(item);
