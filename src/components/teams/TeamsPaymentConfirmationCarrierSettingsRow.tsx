import {
  Button,
  Checkbox,
  IconButton,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from '@material-ui/core';
import firebase from '../../firebase';
import { isEqual, set } from 'lodash/fp';
import { useSnackbar } from 'notistack';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import Carriers from '../../contexts/Carriers';
import Ports from '../../contexts/Ports';
import Carrier from '../../model/Carrier';
import { CarrierSettingsRule } from '../../model/PaymentConfirmationRule';
import Port from '../../model/Port';
import { GlobalContext } from '../../store/GlobalStore';
import AutomaticEmailSendSwitch from '../AutomaticEmailSendSwitch';
import CarrierInput from '../inputs/CarrierInput';
import MultipleEmailInput from '../inputs/MultipleEmailInput';
import PortInput from '../inputs/PortInput';
import { omitAutomaticMessage } from './TeamsPaymentConfirmationCustomerSettingsRow';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import { tryGetErrorMessage } from '../../utilities/errorHelper';

interface Props {
  paymentConfirmation: CarrierSettingsRule;
  selected: boolean;
  onSelectRow: (event: React.MouseEvent<HTMLElement>) => void;
  onCopy: (id: string) => Promise<void>;
}

const TeamPaymentConfirmationCarrierSettingsRow: React.FC<Props> = ({
  paymentConfirmation,
  selected,
  onSelectRow,
  onCopy,
  ...other
}) => {
  const carriers = useContext(Carriers);
  const ports = useContext(Ports);
  const [, dispatch] = useContext(GlobalContext);
  const [paymentConfirmationState, setPaymentConfirmationState] =
    useState<CarrierSettingsRule>(paymentConfirmation);
  const { enqueueSnackbar } = useSnackbar();

  const { carrier, port, contactCC, contactTo } = paymentConfirmationState;

  const changed = useMemo(
    () =>
      !isEqual(omitAutomaticMessage(paymentConfirmation))(
        omitAutomaticMessage(paymentConfirmationState),
      ),
    [paymentConfirmationState, paymentConfirmation],
  );

  const handleEditPaymentConfirmation = useCallback(async () => {
    if (!carrier || !port) return;

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
      enqueueSnackbar(<Typography color="inherit"> {tryGetErrorMessage(error)}!</Typography>, {
        variant: 'error',
        autoHideDuration: 3000,
      });
    }
  }, [carrier, port, dispatch, paymentConfirmation.id, paymentConfirmationState, enqueueSnackbar]);

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
        <CarrierInput
          carriers={carriers}
          onChange={carrier => changeData('carrier', carrier)}
          value={carrier}
        />
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
        {changed ? (
          <Button
            onClick={handleEditPaymentConfirmation}
            size="small"
            color="primary"
            variant="contained"
          >
            Save
          </Button>
        ) : (
          <Tooltip title="Copy">
            <IconButton
              onClick={() => onCopy(paymentConfirmation.id)}
              aria-label="copy"
              color="primary"
            >
              <FileCopyIcon />
            </IconButton>
          </Tooltip>
        )}
      </TableCell>
    </TableRow>
  );
};

export default TeamPaymentConfirmationCarrierSettingsRow;
