import { CarrierSettingsRule, PaymentConfirmationType } from '../model/PaymentConfirmationRule';
import useFirestoreCollection from './useFirestoreCollection';
import { useCallback } from 'react';

export default (carrierId: string, type: PaymentConfirmationType) => {
  console.log(carrierId);
  const carrierSettingsRef = useFirestoreCollection(
    'payment-confirmation-config',
    useCallback(
      query => {
        query = query.where(
          'carrier.id',
          '==',
          carrierId === 'HAMBURG SÜD' ? 'HSG' : carrierId === 'HUGO STINNES' ? 'STNN' : carrierId!,
        );
        return query.where('type', '==', type);
      },
      [carrierId, type],
    ),
  );

  return carrierSettingsRef?.docs.map(carrierSetting => carrierSetting.data()) as CarrierSettingsRule[];
};
