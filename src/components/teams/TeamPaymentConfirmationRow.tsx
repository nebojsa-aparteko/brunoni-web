import { Button, Checkbox, TableCell, TableRow } from '@material-ui/core';
import firebase from 'firebase';
import { isEqual, set } from 'lodash/fp';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import Carriers from '../../contexts/Carriers';
import Ports from '../../contexts/Ports';
import Carrier from '../../model/Carrier';
import PaymentConfirmationRule from '../../model/PaymentConfirmationRule';
import Port from '../../model/Port';
import { GlobalContext } from '../../store/GlobalStore';
import AutomaticEmailSendSwitch from '../AutomaticEmailSendSwitch';
import CarrierInput from '../inputs/CarrierInput';
import MultipleEmailInput from '../inputs/MultipleEmailInput';
import PortInput from '../inputs/PortInput';

interface PropsI {
  paymentConfirmation: PaymentConfirmationRule;
  selected: boolean;
  onSelectRow: (event: React.MouseEvent<HTMLElement>) => void;
}

const TeamPaymentConfirmationRow: React.FC<PropsI> = ({ paymentConfirmation, selected, onSelectRow, ...other }) => {
  const carriers = useContext(Carriers);
  const ports = useContext(Ports);
  const [, dispatch] = useContext(GlobalContext);
  const [paymentConfirmationState, setPaymentConfirmationState] = useState<PaymentConfirmationState>(
    paymentConfirmation,
  );
  const { carrier, port, contactCC, contactTo } = paymentConfirmationState;
  const changed = useMemo(() => !isEqual(paymentConfirmation)(paymentConfirmationState), [
    paymentConfirmationState,
    paymentConfirmation,
  ]);

  const handleEditPaymentConfirmation = useCallback(async () => {
    if (!carrier || !port) return;

    dispatch({ type: 'START_GLOBAL_LOADING' });
    try {
      await firebase
        .firestore()
        .collection('payment-confirmation-config')
        .doc(paymentConfirmation.id)
        .set(paymentConfirmation, { merge: true });
      dispatch({ type: 'STOP_GLOBAL_LOADING' });
    } catch (error) {
      console.error(error);
      dispatch({ type: 'STOP_GLOBAL_LOADING' });
    }
  }, [paymentConfirmationState, paymentConfirmation.id, dispatch]);

  const changeData = useCallback((path: string, value?: Carrier | Port | string[] | null) => {
    setPaymentConfirmationState(prevState => set(path, value)(prevState));
  }, []);

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
        <MultipleEmailInput
          data={[]}
          selectedEmails={contactTo}
          setSelectedEmails={emails => changeData('contactTo', emails)}
        />
      </TableCell>
      <TableCell align="left">
        <MultipleEmailInput
          data={[]}
          selectedEmails={contactCC}
          setSelectedEmails={emails => changeData('contactCC', emails)}
        />
      </TableCell>
      <TableCell align="left">
        <PortInput ports={ports || []} onChange={port => changeData('port', port)} value={port} />
      </TableCell>
      <TableCell align="left">
        <AutomaticEmailSendSwitch
          paymentConfirmationId={paymentConfirmation.id}
          automaticMessage={paymentConfirmation.automaticMessage}
        />
      </TableCell>
      <TableCell align="right">
        {changed && (
          <Button onClick={handleEditPaymentConfirmation} size="small" color="primary" variant="contained">
            Save
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

export default TeamPaymentConfirmationRow;

interface PaymentConfirmationState {
  carrier?: Carrier;
  port?: Port;
  contactTo?: string[];
  contactCC?: string[];
  automaticMessage?: boolean;
}
