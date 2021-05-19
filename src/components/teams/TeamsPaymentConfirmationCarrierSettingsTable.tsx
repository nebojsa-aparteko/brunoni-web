import React, { useCallback, useContext, useState } from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import { Checkbox, TableBody, Typography } from '@material-ui/core';
import { EnhancedTableToolbar } from '../EnhancedTableToolbar';
import ConfirmationDialog from '../ConfirmationDialog';
import { GlobalContext } from '../../store/GlobalStore';
import firebase from '../../firebase';
import usePaymentConfirmation from '../../hooks/usePaymentConfirmation';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import TeamPaymentConfirmationCarrierSettingsRow from './TeamsPaymentConfirmationCarrierSettingsRow';
import { useSnackbar } from 'notistack';
import TeamsPaymentConfirmationCarrierSettingsAddDialog from './TeamsPaymentConfirmationCarrierSettingsAddDialog';
import { CarrierSettingsRule, PaymentConfirmationType } from '../../model/PaymentConfirmationRule';

const useStyles = makeStyles(() =>
  createStyles({
    tableContainer: {
      flex: 1,
    },
  }),
);

const TeamsPaymentConfirmationCarrierSettingsTable: React.FC = () => {
  const classes = useStyles();

  const paymentConfirmations = usePaymentConfirmation(PaymentConfirmationType.CARRIER_SETTINGS);
  const [selectedPaymentConfirmations, setSelectedPaymentConfirmations] = useState<string[]>([]);
  const [isPaymentConfirmationDialogOpen, setIsPaymentConfirmationDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [, dispatch] = useContext(GlobalContext);
  const { enqueueSnackbar } = useSnackbar();

  const onSelectRow = useCallback(
    (event: React.MouseEvent<HTMLElement>, id: string) => {
      event.stopPropagation();
      setSelectedPaymentConfirmations(prevState =>
        selectedPaymentConfirmations.includes(id) ? [...prevState.filter(t => t !== id)] : [...prevState, id],
      );
    },
    [selectedPaymentConfirmations],
  );

  const handleSelectDeselectAll = () => {
    if (selectedPaymentConfirmations.length !== paymentConfirmations.length) {
      setSelectedPaymentConfirmations(paymentConfirmations.map(paymentConfirmation => paymentConfirmation.id));
    } else {
      setSelectedPaymentConfirmations([]);
    }
  };

  const deletePaymentConfirmation = async (paymentConfirmationId: string) =>
    await firebase
      .firestore()
      .collection('payment-confirmation-config')
      .doc(paymentConfirmationId)
      .delete();

  const handleDeletePaymentConfirmations = useCallback(() => {
    dispatch({ type: 'START_GLOBAL_LOADING' });

    try {
      selectedPaymentConfirmations.map(paymentConfirmationId => deletePaymentConfirmation(paymentConfirmationId));

      dispatch({ type: 'STOP_GLOBAL_LOADING' });
      setIsConfirmationDialogOpen(false);
      setSelectedPaymentConfirmations([]);
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
  }, [dispatch, enqueueSnackbar, selectedPaymentConfirmations]);

  const handleCopy = useCallback(
    async (id: string) => {
      dispatch({ type: 'START_GLOBAL_LOADING' });
      const collectionRef = firebase.firestore().collection('payment-confirmation-config');
      try {
        const exitingPaymentConfirmation = await collectionRef.doc(id).get();
        const dataCopy = exitingPaymentConfirmation.data() as CarrierSettingsRule;
        if (exitingPaymentConfirmation) {
          const ref = collectionRef.doc();
          const createdAt = firebase.firestore.Timestamp.now();
          await ref.set({ ...dataCopy, id: ref.id, createdAt });
        }
        dispatch({ type: 'STOP_GLOBAL_LOADING' });
      } catch (error) {
        console.error(error);
        dispatch({ type: 'STOP_GLOBAL_LOADING' });
        enqueueSnackbar(<Typography color="inherit"> {error.message}!</Typography>, {
          variant: 'error',
          autoHideDuration: 3000,
        });
      }
    },
    [dispatch, enqueueSnackbar],
  );

  return (
    <>
      {!paymentConfirmations ? (
        <ChartsCircularProgress />
      ) : (
        <TableContainer component={Paper} className={classes.tableContainer}>
          <EnhancedTableToolbar
            numSelected={selectedPaymentConfirmations.length}
            handleAdd={() => setIsPaymentConfirmationDialogOpen(true)}
            handleDelete={() => setIsConfirmationDialogOpen(true)}
            labelWhenSelected={
              selectedPaymentConfirmations.length === 1
                ? `${selectedPaymentConfirmations.length} setting selected`
                : `${selectedPaymentConfirmations.length} settings selected`
            }
            labelWhenNotSelected={''}
            addButtonLabel={'Add carrier setting'}
            deleteButtonLabel={selectedPaymentConfirmations.length === 1 ? `Delete setting` : `Delete settings`}
          />
          <Table aria-label="a dense table">
            <colgroup>
              <col style={{ width: '2.5%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '7.5%' }} />
            </colgroup>
            <TableHead>
              <TableRow>
                <TableCell align="left" style={{ paddingLeft: 4 }}>
                  <Checkbox
                    checked={selectedPaymentConfirmations.length === paymentConfirmations.length}
                    onClick={handleSelectDeselectAll}
                    onFocus={event => event.stopPropagation()}
                    color="primary"
                  />
                </TableCell>
                <TableCell align="left">Carrier</TableCell>
                <TableCell align="left">Contact To</TableCell>
                <TableCell align="left">Contact CC</TableCell>
                <TableCell align="left">Port of discharge</TableCell>
                <TableCell align="left">Send message</TableCell>
                <TableCell align="left" />
              </TableRow>
            </TableHead>
            <TableBody>
              {paymentConfirmations.map((paymentConfirmation, index) => (
                <TeamPaymentConfirmationCarrierSettingsRow
                  paymentConfirmation={paymentConfirmation}
                  key={`payment-confirmation-${paymentConfirmation.id}-${index}`}
                  selected={
                    paymentConfirmation.id ? selectedPaymentConfirmations.includes(paymentConfirmation.id) : false
                  }
                  onSelectRow={event => paymentConfirmation.id && onSelectRow(event, paymentConfirmation.id)}
                  onCopy={handleCopy}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <TeamsPaymentConfirmationCarrierSettingsAddDialog
        isOpen={isPaymentConfirmationDialogOpen}
        handleClose={() => setIsPaymentConfirmationDialogOpen(false)}
      />
      <ConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        label={'Please confirm deletion'}
        handleConfirm={handleDeletePaymentConfirmations}
        handleClose={() => setIsConfirmationDialogOpen(false)}
        description={`Are you sure you want remove this selected setting${
          selectedPaymentConfirmations.length > 1 ? 's' : ''
        }?`}
      />
    </>
  );
};

export default TeamsPaymentConfirmationCarrierSettingsTable;
