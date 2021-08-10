import React, { ChangeEvent, useCallback, useContext } from 'react';
import { FormControl, Switch, Typography } from '@material-ui/core';
import firebase from '../firebase';
import { GlobalContext } from '../store/GlobalStore';
import { useSnackbar } from 'notistack';

interface Props {
  paymentConfirmationId: string;
  automaticMessage?: boolean;
}

const AutomaticEmailSendSwitch: React.FC<Props> = ({ automaticMessage, paymentConfirmationId }) => {
  const [, dispatch] = useContext(GlobalContext);
  const { enqueueSnackbar } = useSnackbar();

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
        enqueueSnackbar(<Typography color="inherit">Saved changes!</Typography>, {
          variant: 'success',
          autoHideDuration: 2000,
        });
      } catch (error) {
        console.error(error);
        dispatch({ type: 'STOP_GLOBAL_LOADING' });
        enqueueSnackbar(<Typography color="inherit"> {error.message}!</Typography>, {
          variant: 'error',
          autoHideDuration: 3000,
        });
      }
    },
    [dispatch, enqueueSnackbar, paymentConfirmationId],
  );

  return (
    <FormControl>
      <Switch checked={automaticMessage} onChange={saveChanges} name="automatic message" color="primary" />
    </FormControl>
  );
};

export default AutomaticEmailSendSwitch;
