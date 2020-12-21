import { useMemo } from 'react';
import firebase from '../firebase';
import WeeklyPayment, { WeeklyPaymentPlatformStatus, WeeklyPaymentStatus } from '../model/WeeklyPayment';
import useFirestoreCollection from './useFirestoreCollection';
import { useWeeklyPaymentFilterProviderContext } from '../providers/WeeklyPaymentFilterProvider';
import { update } from 'lodash/fp';
import safeInvoke from '../utilities/safeInvoke';

export default (bookingId?: string) => {
  const [filters] = useWeeklyPaymentFilterProviderContext();
  const { carrier, paymentDate, status, platformStatus } = filters;

  const query = useMemo(
    () => (collection: firebase.firestore.Query) => {
      if (bookingId) {
        return collection.where('bookingId', '==', bookingId);
      }
      let query = collection.orderBy('bookingId', 'asc');
      if (paymentDate) {
        query = query.where('payDate', '==', paymentDate);
      }
      if (status || (platformStatus && platformStatus.length > 0)) {
        // we must add IN_PROGRESS if platformStatus ON_HOLD is selected and BLOCKED if platformStatus CLEARED is selected and filter them locally
        let extendedStatusArray: string[] = status ? [...status] : [];
        if (platformStatus && platformStatus.length > 0) {
          if (platformStatus && platformStatus.length === 1) {
            if (
              platformStatus.includes(WeeklyPaymentPlatformStatus.ON_HOLD) &&
              !extendedStatusArray.includes(WeeklyPaymentStatus.IN_PROGRESS)
            ) {
              extendedStatusArray = extendedStatusArray.concat(WeeklyPaymentStatus.IN_PROGRESS as string);
              query = query.where('platformStatus', '==', WeeklyPaymentPlatformStatus.ON_HOLD);
            }
            if (
              platformStatus.includes(WeeklyPaymentPlatformStatus.CLEARED) &&
              !extendedStatusArray.includes(WeeklyPaymentStatus.BLOCKED)
            ) {
              extendedStatusArray = extendedStatusArray.concat(WeeklyPaymentStatus.BLOCKED as string);
              query = query.where('platformStatus', '==', WeeklyPaymentPlatformStatus.CLEARED);
            }
          } else {
            extendedStatusArray = extendedStatusArray.concat(
              WeeklyPaymentStatus.IN_PROGRESS as string,
              WeeklyPaymentStatus.BLOCKED as string,
            );
          }
        }
        if (extendedStatusArray.length > 0) {
          query = query.where('status', 'in', extendedStatusArray);
        }
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
    [paymentDate, carrier, bookingId, status, platformStatus],
  );

  const paymentCollection = useFirestoreCollection('weeklyPayment', query);
  return paymentCollection?.docs.map(doc => {
    return { id: doc.id, ...normalizePaymentOverview(doc.data()) } as WeeklyPayment;
  }) as WeeklyPayment[];
};

export const normalizePaymentOverview = (item: any) => update('payDate', safeInvoke('toDate'))(item);
