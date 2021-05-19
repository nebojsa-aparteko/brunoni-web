import { Button, IconButton, Tooltip, Checkbox, TableCell, TableRow, Typography } from '@material-ui/core';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import firebase from 'firebase';
import { isEqual, omit, set } from 'lodash/fp';
import { useSnackbar } from 'notistack';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import Carriers from '../../contexts/Carriers';
import useClients from '../../hooks/useClients';
import Carrier from '../../model/Carrier';
import Client from '../../model/Client';
import { CustomerSettingsRule, CarrierSettingsRule } from '../../model/PaymentConfirmationRule';
import { GlobalContext } from '../../store/GlobalStore';
import AutomaticEmailSendSwitch from '../AutomaticEmailSendSwitch';
import { BookingCategory } from '../../model/Booking';
import CategoryFilter from '../CategoryFilter';
import CarrierInput from '../inputs/CarrierInput';
import ClientInput from '../inputs/ClientInput';
import MultipleEmailInput from '../inputs/MultipleEmailInput';

interface Props {
  paymentConfirmation: CustomerSettingsRule;
  selected: boolean;
  onSelectRow: (event: React.MouseEvent<HTMLElement>) => void;
  onCopy: (id: string) => Promise<void>;
}

// utility function to remove automaticMessage field from paymentConfirmation Object
export const omitAutomaticMessage = (paymentConfirmation: CustomerSettingsRule | CarrierSettingsRule) => {
  return omit(['automaticMessage'])(paymentConfirmation);
};

const TeamPaymentConfirmationCustomerSettingsRow: React.FC<Props> = ({
  paymentConfirmation,
  selected,
  onSelectRow,
  onCopy,
  ...other
}) => {
  const carriers = useContext(Carriers);
  const clients = useClients();
  const [, dispatch] = useContext(GlobalContext);
  const [paymentConfirmationState, setPaymentConfirmationState] = useState<CustomerSettingsRule>(paymentConfirmation);
  const { enqueueSnackbar } = useSnackbar();

  // console.log('state', paymentConfirmationState);
  // console.log('normal', paymentConfirmation);

  const { carrier, category, client, contact, statisticClient } = paymentConfirmationState;

  const changed = useMemo(
    () => !isEqual(omitAutomaticMessage(paymentConfirmation))(omitAutomaticMessage(paymentConfirmationState)),
    [paymentConfirmation, paymentConfirmationState],
  );

  const handleEditClientStatistic = useCallback(async () => {
    if (!carrier || !client) return;

    dispatch({ type: 'START_GLOBAL_LOADING' });
    try {
      await firebase
        .firestore()
        .collection('payment-confirmation-config')
        .doc(paymentConfirmation.id)
        .set(paymentConfirmationState, { merge: true });
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
  }, [carrier, client, dispatch, enqueueSnackbar, paymentConfirmation.id, paymentConfirmationState]);

  const changeData = useCallback((path: string, value?: Carrier | Client | string | string[] | null) => {
    setPaymentConfirmationState(prevState => set(path, value)(prevState));
  }, []);

  const handleImportOrExportChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    changeData('category', (event.target as HTMLInputElement).value as BookingCategory);
  };

  return (
    <TableRow {...other}>
      <TableCell align="left" padding="checkbox">
        <Checkbox
          checked={selected}
          onClick={event => onSelectRow(event)}
          onFocus={event => event.stopPropagation()}
          color="primary"
        />
      </TableCell>
      <TableCell align="left">
        <CarrierInput carriers={carriers} onChange={carrier => changeData('carrier', carrier)} value={carrier} />
      </TableCell>
      <TableCell align="left">
        <CategoryFilter value={category} onChange={handleImportOrExportChange} />
      </TableCell>
      <TableCell align="left">
        <ClientInput
          label=""
          clients={clients || []}
          onChange={client => changeData('client', client)}
          value={client}
        />
      </TableCell>
      <TableCell align="left">
        <MultipleEmailInput
          data={[]}
          selectedEmails={contact}
          setSelectedEmails={emails => changeData('contact', emails)}
        />
      </TableCell>
      <TableCell align="left">
        <ClientInput
          label=""
          clients={clients || []}
          onChange={statisticClient => changeData('statisticClient', statisticClient)}
          value={statisticClient}
        />
      </TableCell>
      <TableCell align="left">
        <AutomaticEmailSendSwitch
          paymentConfirmationId={paymentConfirmation.id}
          automaticMessage={paymentConfirmation.automaticMessage}
        />
      </TableCell>
      <TableCell align="right">
        {changed ? (
          <Button onClick={handleEditClientStatistic} size="small" color="primary" variant="contained">
            Save
          </Button>
        ) : (
          <Tooltip title="Copy">
            <IconButton onClick={() => onCopy(paymentConfirmation.id)} aria-label="copy" color="primary">
              <FileCopyIcon />
            </IconButton>
          </Tooltip>
        )}
      </TableCell>
    </TableRow>
  );
};

export default TeamPaymentConfirmationCustomerSettingsRow;
