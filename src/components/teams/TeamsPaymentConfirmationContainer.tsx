import React, { useCallback, useContext, useState } from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
//import TableBody from '@material-ui/core/TableBody';
import TableContainer from '@material-ui/core/TableContainer';
import {
  Box,
  Button,
  Checkbox,
  //Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TableBody,
  Typography,
} from '@material-ui/core';
import { EnhancedTableToolbar } from '../EnhancedTableToolbar';
import CloseIcon from '@material-ui/icons/Close';
import CarrierInput from '../inputs/CarrierInput';
import Carrier from '../../model/Carrier';
import Carriers from '../../contexts/Carriers';
import ConfirmationDialog from '../ConfirmationDialog';
import { GlobalContext } from '../../store/GlobalStore';
import PortInput from '../inputs/PortInput';
import Ports from '../../contexts/Ports';
import Port from '../../model/Port';
import MultipleEmailInput from '../inputs/MultipleEmailInput';
import firebase from '../../firebase';
import usePaymentConfirmation from '../../hooks/usePaymentConfirmation';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import TeamPaymentConfirmationRow from './TeamPaymentConfirmationRow';
import PaymentConfirmationRule from '../../model/PaymentConfirmationRule';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    table: {
      minWidth: 650,
    },
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

interface AddPaymentConfirmationProps {
  isOpen: boolean;
  handleClose: () => void;
}

const AddPaymentConfirmationDialog: React.FC<AddPaymentConfirmationProps> = ({ isOpen, handleClose }) => {
  const classes = useStyles();
  const carriers = useContext(Carriers);
  const ports = useContext(Ports);
  const [, dispatch] = useContext(GlobalContext);

  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | undefined>(undefined);
  const [selectedPort, setSelectedPort] = useState<Port | undefined>(undefined);
  const [selectedContactTo, setSelectedContactTo] = useState<string[]>([]);
  const [selectedContactCC, setSelectedContactCC] = useState<string[]>([]);

  const handleAddPaymentConfirmation = useCallback(async () => {
    dispatch({ type: 'START_GLOBAL_LOADING' });
    //todo form validation?
    if (!selectedCarrier || !selectedPort) return;

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
    };

    //console.log(data);
    dispatch({ type: 'START_GLOBAL_LOADING' });
    try {
      await firebase
        .firestore()
        .collection('payment-confirmation-config')
        .doc()
        .set(data);
      dispatch({ type: 'STOP_GLOBAL_LOADING' });
    } catch (error) {
      console.error(error);
      dispatch({ type: 'STOP_GLOBAL_LOADING' });
    }
  }, [selectedCarrier, selectedPort, selectedContactTo, selectedContactCC, dispatch]);

  return (
    <Dialog open={isOpen} onClose={handleClose} aria-labelledby="ReassignmentRulesDialogTitle" maxWidth="md">
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

const TeamsPaymentConfirmationContainer = () => {
  const classes = useStyles();

  const paymentConfirmation = usePaymentConfirmation();
  const [selectedPaymentConfirmations, setSelectedPaymentConfirmations] = useState<string[]>([]);
  const [isPaymentConfirmationDialogOpen, setIsPaymentConfirmationDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [, dispatch] = useContext(GlobalContext);

  const onSelectRow = useCallback(
    (event: React.MouseEvent<HTMLElement>, id: string) => {
      event.stopPropagation();
      setSelectedPaymentConfirmations(prevState =>
        selectedPaymentConfirmations.includes(id) ? [...prevState.filter(t => t !== id)] : [...prevState, id],
      );
    },
    [selectedPaymentConfirmations],
  );

  // const handleSelectDeselectAll = () => {
  //   if (selectedPaymentConfirmations.length !== adminUsers.length) {
  //     //setSelectedPaymentConfirmations( todo );
  //   } else {
  //     setSelectedPaymentConfirmations([]);
  //   }
  // };

  const handleRemoveReassignmentRule = useCallback(() => {
    //dispatch({ type: 'START_GLOBAL_LOADING' });
  }, []);

  return (
    <>
      {!paymentConfirmation ? (
        <ChartsCircularProgress />
      ) : (
        <Paper>
          <EnhancedTableToolbar
            numSelected={selectedPaymentConfirmations.length}
            handleAdd={() => setIsPaymentConfirmationDialogOpen(true)}
            handleDelete={() => setIsConfirmationDialogOpen(true)}
            labelWhenSelected={
              selectedPaymentConfirmations.length === 1
                ? `${selectedPaymentConfirmations.length} confirmation selected`
                : `${selectedPaymentConfirmations.length} confirmations selected`
            }
            labelWhenNotSelected={'Payment confirmation'}
          />
          <TableContainer>
            <Table className={classes.table} aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell align="left" style={{ paddingLeft: 4 }}>
                    <Checkbox
                      checked={false}
                      onClick={event => event.stopPropagation()}
                      onFocus={event => event.stopPropagation()}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell align="left">Carrier</TableCell>
                  <TableCell align="left">Contact To</TableCell>
                  <TableCell align="left">Contact CC</TableCell>
                  <TableCell align="left">Port of discharge</TableCell>
                  <TableCell align="left">Send message</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paymentConfirmation?.map((paymentConfirmation, index) => (
                  <TeamPaymentConfirmationRow
                    paymentConfirmation={paymentConfirmation}
                    key={`payment-confirmation-${paymentConfirmation.id}-${index}`}
                    selected={
                      paymentConfirmation.id ? selectedPaymentConfirmations.includes(paymentConfirmation.id) : false
                    }
                    onSelectRow={event => paymentConfirmation.id && onSelectRow(event, paymentConfirmation.id)}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
      <AddPaymentConfirmationDialog
        isOpen={isPaymentConfirmationDialogOpen}
        handleClose={() => setIsPaymentConfirmationDialogOpen(false)}
      />
      <ConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        label={'Please confirm'}
        handleConfirm={handleRemoveReassignmentRule}
        handleClose={() => setIsConfirmationDialogOpen(false)}
        description="Are you sure you want remove this payment confirmation?"
      />
    </>
  );
};

export default TeamsPaymentConfirmationContainer;
