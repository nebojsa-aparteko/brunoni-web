import { useContext, useMemo } from 'react';
import { UserRole } from '../model/Task';
import ActingAs from '../contexts/ActingAs';
import UserRecordContext from '../contexts/UserRecordContext';
import firebase from '../firebase';
import pick from 'lodash/fp/pick';
import { UserRecordMinProperties } from '../model/UserRecord';
import WeeklyPayment from '../model/WeeklyPayment';
import useFirestoreCollection from './useFirestoreCollection';
import { useWeeklyPaymentFilterProviderContext } from '../providers/WeeklyPaymentFilterProvider';
import { update } from 'lodash/fp';
import safeInvoke from '../utilities/safeInvoke';

export default () => {
  const [filters] = useWeeklyPaymentFilterProviderContext();
  const { carrier, paymentDate } = filters;
  const [actingAs] = useContext(ActingAs);
  const userRecord = useContext(UserRecordContext);

  const query = useMemo(
    () => (collection: firebase.firestore.Query) => {
      let query = collection.orderBy('bookingId', 'asc').limit(100);
      // let query = collection.where('resolved', '==', false).where('show', '==', true);
      if (paymentDate) {
        // query = query.where('assignedUser', '==', pick(UserRecordMinProperties)(assignee));
      }
      if (actingAs) {
        // query = query.where('assignedUser', '==', pick(UserRecordMinProperties)(userRecord));
      }
      return query;
    },
    [filters, paymentDate, UserRecordMinProperties, pick, carrier, UserRole, actingAs, userRecord],
  );

  const paymentCollection = useFirestoreCollection('weeklyPayment', query);

  return paymentCollection?.docs.map(doc => {
    return { id: doc.id, ...doc.data() } as WeeklyPayment;
  }) as WeeklyPayment[];
};

export const normalizePaymentOverview = (item: any) => update('payDate', safeInvoke('toDate'))(item);
