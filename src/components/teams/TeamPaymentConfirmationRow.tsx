import { Button, Checkbox, TableCell, TableRow } from '@material-ui/core';
import firebase from 'firebase';
import { type } from 'os';
import React, { useCallback, useContext, useEffect, useState } from 'react';
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

type EditPaymentConfirmationRule = Omit<PaymentConfirmationRule, 'id'>;

const TeamPaymentConfirmationRow: React.FC<PropsI> = ({ paymentConfirmation, selected, onSelectRow, ...other }) => {
  const carriers = useContext(Carriers);
  const ports = useContext(Ports);
  const [, dispatch] = useContext(GlobalContext);

  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | undefined>(paymentConfirmation.carrier);
  const [selectedPort, setSelectedPort] = useState<Port | undefined>(paymentConfirmation.port);
  const [selectedContactTo, setSelectedContactTo] = useState<string[]>(paymentConfirmation.contactTo);
  const [selectedContactCC, setSelectedContactCC] = useState<string[]>(paymentConfirmation.contactCC);

  const [changed, setChanged] = useState(false);

  useEffect(() => {
    setChanged(true);
  }, [selectedCarrier, selectedPort, selectedContactTo, selectedContactCC]);

  const handleEditPaymentConfirmation = useCallback(async () => {
    if (!selectedCarrier || !selectedPort) return;

    const dataToEdit: EditPaymentConfirmationRule = {
      carrier: selectedCarrier,
      port: selectedPort,
      contactTo: selectedContactTo,
      contactCC: selectedContactCC,
      automaticMessage: true,
    };

    //console.log(data);
    dispatch({ type: 'START_GLOBAL_LOADING' });
    try {
      await firebase
        .firestore()
        .collection('payment-confirmation-config')
        .doc(paymentConfirmation.id)
        .set(dataToEdit, { merge: true });
      dispatch({ type: 'STOP_GLOBAL_LOADING' });
    } catch (error) {
      console.error(error);
      dispatch({ type: 'STOP_GLOBAL_LOADING' });
    }
  }, [selectedCarrier, selectedPort, selectedContactTo, selectedContactCC, paymentConfirmation.id, dispatch]);

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
        <CarrierInput
          carriers={carriers}
          onChange={carrier => setSelectedCarrier(carrier || undefined)}
          value={selectedCarrier}
        />
      </TableCell>
      <TableCell align="left">
        <MultipleEmailInput data={[]} selectedEmails={selectedContactTo} setSelectedEmails={setSelectedContactTo} />
      </TableCell>
      <TableCell align="left">
        <MultipleEmailInput data={[]} selectedEmails={selectedContactCC} setSelectedEmails={setSelectedContactCC} />
      </TableCell>
      <TableCell align="left">
        <PortInput
          ports={ports || []}
          onChange={port => {
            // setChanged(true);
            setSelectedPort(port || undefined);
          }}
          value={selectedPort}
        />
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
