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
import MultipleEmailInput from '../inputs/MultipleEmailInput';
import firebase from '../../firebase';
import { CustomerSettingsRule, ImpExp, PaymentConfirmationType } from '../../model/PaymentConfirmationRule';
import ClientInput from '../inputs/ClientInput';
import useClients from '../../hooks/useClients';
import Client from '../../model/Client';
import { useSnackbar } from 'notistack';
import CategoryMultiSelect from '../CategoryMultiSelect';

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

const TeamsPaymentConfirmationCustomerSettingsAddDialog: React.FC<Props> = ({ isOpen, handleClose }) => {
  const classes = useStyles();
  const carriers = useContext(Carriers);
  const clients = useClients();
  const [, dispatch] = useContext(GlobalContext);
  const { enqueueSnackbar } = useSnackbar();

  // TODO CLEAR STATE AFTER CLOSING DIALOG???
  // TODO REFACTOR AND CREATE MORE REUSABLE COMPONENTS ???
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<ImpExp>({ export: false, import: false });
  const [selectedClient, setSelectedClient] = useState<Client | undefined | null>(undefined);
  const [selectedContact, setSelectedContact] = useState<string[]>([]);
  const [selectedStatisticsClient, setSelectedStatisticsClient] = useState<Client | undefined | null>(undefined);

  const handleImportOrExportChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedCategory({ ...selectedCategory, [event.target.name]: event.target.checked });
  };

  const handleAddCustomerSetting = useCallback(async () => {
    //TODO FORM VALIDATION
    if (!selectedCarrier || !selectedClient || !selectedStatisticsClient) return;

    dispatch({ type: 'START_GLOBAL_LOADING' });

    const ref = firebase
      .firestore()
      .collection('payment-confirmation-config')
      .doc();

    const data: CustomerSettingsRule = {
      id: ref.id,
      carrier: selectedCarrier,
      category: selectedCategory,
      client: selectedClient,
      contact: selectedContact,
      statisticClient: selectedStatisticsClient,
      automaticMessage: true,
      type: PaymentConfirmationType.CUSTOMER_SETTINGS,
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
  }, [
    selectedCarrier,
    selectedClient,
    selectedStatisticsClient,
    dispatch,
    selectedCategory,
    selectedContact,
    handleClose,
    enqueueSnackbar,
  ]);

  return (
    <Dialog open={isOpen} onClose={handleClose} aria-labelledby="ReassignmentRulesDialogTitle" maxWidth="xl">
      <DialogTitle disableTypography id="ReassignmentRulesDialogTitle">
        <Typography variant="h4">Add new customer setting</Typography>
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
        <Box maxWidth={250}>
          <CategoryMultiSelect value={selectedCategory} onChange={handleImportOrExportChange} />
        </Box>
        <Box minWidth={250} maxWidth={300} margin={2}>
          <ClientInput
            label="Choose client"
            clients={clients || []}
            onChange={setSelectedClient}
            value={selectedClient}
          />
        </Box>
        <Box minWidth={250} maxWidth={300} margin={2}>
          <MultipleEmailInput
            data={[]}
            label="Contact"
            selectedEmails={selectedContact}
            setSelectedEmails={setSelectedContact}
          />
        </Box>
        <Box minWidth={250} maxWidth={300} margin={2}>
          <ClientInput
            label="Choose statistic client"
            clients={clients || []}
            onChange={setSelectedStatisticsClient}
            value={selectedStatisticsClient}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button color="primary" variant="contained" onClick={handleAddCustomerSetting} style={{ minWidth: 80 }}>
          Add customer setting
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamsPaymentConfirmationCustomerSettingsAddDialog;
