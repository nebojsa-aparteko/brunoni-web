import React, { ChangeEvent, useCallback, useContext } from 'react';
import { FormControl, Switch } from '@material-ui/core';
import firebase from '../firebase';
import { GlobalContext } from '../store/GlobalStore';

interface Props {
  paymentConfirmationId: string;
  automaticMessage?: boolean;
}

const AutomaticEmailSendSwitch: React.FC<Props> = ({ automaticMessage, paymentConfirmationId }) => {
  const [, dispatch] = useContext(GlobalContext);

  const saveChanges = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      if (!paymentConfirmationId) return;

      const data = {
        automaticMessage: event.target.checked,
      };

      dispatch({ type: 'START_GLOBAL_LOADING' });
      try {
        await firebase
          .firestore()
          .collection('payment-confirmation-config')
          .doc(paymentConfirmationId)
          .set(data, { merge: true });
        dispatch({ type: 'STOP_GLOBAL_LOADING' });
      } catch (error) {
        console.error(error);
        dispatch({ type: 'STOP_GLOBAL_LOADING' });
      }
    },
    [dispatch, paymentConfirmationId],
  );

  return (
    <FormControl>
      <Switch checked={automaticMessage} onChange={saveChanges} name="automatic message" color="primary" />
    </FormControl>
  );
};

export default AutomaticEmailSendSwitch;
