import React, { ChangeEvent, useCallback } from 'react';
import { FormControl, Switch } from '@material-ui/core';
import firebase from '../firebase';

interface PropsI {
  paymentConfirmationId: string;
  automaticMessage: boolean;
}

const AutomaticEmailSendSwitch: React.FC<PropsI> = ({ automaticMessage, paymentConfirmationId }) => {
  const saveChanges = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      if (!paymentConfirmationId) return;

      const data = {
        automaticMessage: event.target.checked,
      };

      try {
        await firebase
          .firestore()
          .collection('payment-confirmation-config')
          .doc(paymentConfirmationId)
          .set(data, { merge: true });
      } catch (error) {
        console.error(error);
      }
    },
    [paymentConfirmationId],
  );

  return (
    <FormControl>
      <Switch checked={automaticMessage} onChange={saveChanges} name="automatic message" color="primary" />
    </FormControl>
  );
};

export default AutomaticEmailSendSwitch;
