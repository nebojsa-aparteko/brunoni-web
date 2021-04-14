import React, { useCallback, useContext, useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import CarrierInput from '../inputs/CarrierInput';
import Carrier from '../../model/Carrier';
import Carriers from '../../contexts/Carriers';
import { GlobalContext } from '../../store/GlobalStore';
import PortInput from '../inputs/PortInput';
import Ports from '../../contexts/Ports';
import Port from '../../model/Port';
import MultipleEmailInput from '../inputs/MultipleEmailInput';
import firebase from '../../firebase';
import { PaymentConfirmationRule, PaymentConfirmationType } from '../../model/PaymentConfirmationRule';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    dialogContent: {
      paddingBottom: theme.spacing(3),
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      padding: 4,
    },
    closeModal: {
      position: 'absolute',
      top: '5px',
      right: '12px',
      width: '47px',
      height: '47px',
    },
  }),
);

interface Props {
  isOpen: boolean;
  handleClose: () => void;
}

const TeamsPaymentConfirmationAddDialog: React.FC<Props> = ({ isOpen, handleClose }) => {
  const classes = useStyles();
  const carriers = useContext(Carriers);
  const ports = useContext(Ports);
  const [, dispatch] = useContext(GlobalContext);

  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | undefined>(undefined);
  const [selectedPort, setSelectedPort] = useState<Port | undefined>(undefined);
  const [selectedContactTo, setSelectedContactTo] = useState<string[]>([]);
  const [selectedContactCC, setSelectedContactCC] = useState<string[]>([]);

  const handleAddPaymentConfirmation = useCallback(async () => {
    //todo form validation?
    if (!selectedCarrier || !selectedPort) return;

    dispatch({ type: 'START_GLOBAL_LOADING' });

    const ref = firebase
      .firestore()
      .collection('payment-confirmation-config')
      .doc();

    const data: PaymentConfirmationRule = {
      id: ref.id,
      carrier: selectedCarrier,
      port: selectedPort,
      contactTo: selectedContactTo,
      contactCC: selectedContactCC,
      automaticMessage: true,
      type: PaymentConfirmationType.PAYMENT_CONFIRMATION,
    };

    //console.log(data);
    dispatch({ type: 'START_GLOBAL_LOADING' });
    try {
      await ref.set(data);
      handleClose();
      dispatch({ type: 'STOP_GLOBAL_LOADING' });
    } catch (error) {
      console.error(error);
      dispatch({ type: 'STOP_GLOBAL_LOADING' });
    }
  }, [dispatch, selectedCarrier, selectedPort, selectedContactTo, selectedContactCC, handleClose]);

  return (
    <Dialog open={isOpen} onClose={handleClose} aria-labelledby="ReassignmentRulesDialogTitle" maxWidth="lg">
      <DialogTitle disableTypography id="ReassignmentRulesDialogTitle">
        <Typography variant="h4">Add new payment confirmation</Typography>
        <IconButton onClick={handleClose} className={classes.closeModal}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        <Box minWidth={250} maxWidth={300} margin={2}>
          <CarrierInput
            label="Carrier"
            carriers={carriers}
            onChange={carrier => setSelectedCarrier(carrier || undefined)}
            value={selectedCarrier}
          />
        </Box>
        <Box minWidth={250} maxWidth={300} margin={2}>
          <MultipleEmailInput
            data={[]}
            label="Contact To"
            selectedEmails={selectedContactTo}
            setSelectedEmails={setSelectedContactTo}
          />
        </Box>
        <Box minWidth={250} maxWidth={300} margin={2}>
          <MultipleEmailInput
            data={[]}
            label="Contact CC"
            selectedEmails={selectedContactCC}
            setSelectedEmails={setSelectedContactCC}
          />
        </Box>
        <Box minWidth={250} maxWidth={300} margin={2}>
          <PortInput
            label="Port of discharge"
            ports={ports || []}
            onChange={port => setSelectedPort(port || undefined)}
            value={selectedPort}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button color="primary" variant="contained" onClick={handleAddPaymentConfirmation} style={{ minWidth: 80 }}>
          Add payment confirmation
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamsPaymentConfirmationAddDialog;
