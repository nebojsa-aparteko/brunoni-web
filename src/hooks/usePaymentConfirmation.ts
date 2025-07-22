import {
  CarrierSettingsRule,
  CustomerSettingsRule,
  PaymentConfirmationType,
} from '../model/PaymentConfirmationRule';
import useFirestoreCollection from './useFirestoreCollection';
import { useMemo } from 'react';
import firebase from '../firebase';

const usePaymentConfirmation = <T extends PaymentConfirmationType>(
  type: T,
): T extends PaymentConfirmationType.CARRIER_SETTINGS
  ? CarrierSettingsRule[]
  : CustomerSettingsRule[] => {
  const query = useMemo(
    () => (collection: firebase.firestore.Query) => {
      let query = collection.where('type', '==', type);
      query = query.orderBy('createdAt', 'desc');
      return query;
    },
    [type],
  );
  const paymentConfirmationDocs = useFirestoreCollection('payment-confirmation-config', query);
  return paymentConfirmationDocs?.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as any;
};

export default usePaymentConfirmation;
