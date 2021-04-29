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
import { CarrierSettingsRule, PaymentConfirmationType } from '../../model/PaymentConfirmationRule';
import { useSnackbar } from 'notistack';

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

const TeamsPaymentConfirmationCarrierSettingsAddDialog: React.FC<Props> = ({ isOpen, handleClose }) => {
  const classes = useStyles();
  const carriers = useContext(Carriers);
  const ports = useContext(Ports);
  const [, dispatch] = useContext(GlobalContext);
  const { enqueueSnackbar } = useSnackbar();

  // TODO CLEAR STATE AFTER CLOSING DIALOG???
  // TODO REFACTOR AND CREATE MORE REUSABLE COMPONENTS ???
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | undefined>(undefined);
  const [selectedPort, setSelectedPort] = useState<Port | undefined>(undefined);
  const [selectedContactTo, setSelectedContactTo] = useState<string[]>([]);
  const [selectedContactCC, setSelectedContactCC] = useState<string[]>([]);

  const handleAddCarrierSetting = useCallback(async () => {
    //TODO FORM VALIDATION
    if (!selectedCarrier || !selectedPort) return;

    dispatch({ type: 'START_GLOBAL_LOADING' });

    const ref = firebase
      .firestore()
      .collection('payment-confirmation-config')
      .doc();

    const data: CarrierSettingsRule = {
      id: ref.id,
      carrier: selectedCarrier,
      port: selectedPort,
      contactTo: selectedContactTo,
      contactCC: selectedContactCC,
      automaticMessage: true,
      type: PaymentConfirmationType.CARRIER_SETTINGS,
      createdAt: firebase.firestore.Timestamp.now(),
    };

    try {
      await ref.set(data);
      handleClose();
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
  }, [selectedCarrier, selectedPort, dispatch, selectedContactTo, selectedContactCC, handleClose, enqueueSnackbar]);

  return (
    <Dialog open={isOpen} onClose={handleClose} aria-labelledby="PaymentConfirmationDialogTitle" maxWidth="lg">
      <DialogTitle disableTypography id="PaymentConfirmationDialogTitle">
        <Typography variant="h4">Add new carrier setting</Typography>
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
        <Button color="primary" variant="contained" onClick={handleAddCarrierSetting} style={{ minWidth: 80 }}>
          Add carrier setting
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamsPaymentConfirmationCarrierSettingsAddDialog;
