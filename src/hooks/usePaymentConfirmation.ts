import {
  ClientStatisticsRule,
  PaymentConfirmationRule,
  PaymentConfirmationType,
} from '../model/PaymentConfirmationRule';
import useFirestoreCollection from './useFirestoreCollection';
import { useMemo } from 'react';
import firebase from 'firebase';

const usePaymentConfirmation = <T extends PaymentConfirmationType>(
  type: T,
): T extends PaymentConfirmationType.PAYMENT_CONFIRMATION ? PaymentConfirmationRule[] : ClientStatisticsRule[] => {
  const query = useMemo(
    () => (collection: firebase.firestore.Query) => {
      let query = collection.where('type', '==', type);
      return query;
    },
    [type],
  );
  const paymentConfirmationDocs = useFirestoreCollection('payment-confirmation-config', query);
  if (type === PaymentConfirmationType.PAYMENT_CONFIRMATION) {
    return paymentConfirmationDocs?.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as any;
  } else {
    return paymentConfirmationDocs?.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as any;
  }
};

export default usePaymentConfirmation;
