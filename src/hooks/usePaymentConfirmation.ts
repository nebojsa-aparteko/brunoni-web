import PaymentConfirmationRule from '../model/PaymentConfirmationRule';
import useFirestoreCollection from './useFirestoreCollection';

const usePaymentConfirmation = () => {
  const paymentConfirmationDocs = useFirestoreCollection('payment-confirmation-config');
  return paymentConfirmationDocs?.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as PaymentConfirmationRule[];
};

export default usePaymentConfirmation;
