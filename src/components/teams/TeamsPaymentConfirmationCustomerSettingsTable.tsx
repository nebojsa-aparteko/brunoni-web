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
import { useSnackbar } from 'notistack';
import { CustomerSettingsRule, PaymentConfirmationType } from '../../model/PaymentConfirmationRule';
import TeamsPaymentConfirmationCustomerSettingsAddDialog from './TeamsPaymentConfirmationCustomerSettingsAddDialog';
import TeamPaymentConfirmationCustomerSettingsRow from './TeamsPaymentConfirmationCustomerSettingsRow';
import { addSeconds } from 'date-fns';

const useStyles = makeStyles(() =>
  createStyles({
    tableContainer: {
      flex: 1,
    },
  }),
);

const TeamsPaymentConfirmationCustomerSettingsTable: React.FC = () => {
  const classes = useStyles();

  const paymentConfirmations = usePaymentConfirmation(PaymentConfirmationType.CUSTOMER_SETTINGS);
  const [selectedPaymentConfirmations, setSelectedPaymentConfirmations] = useState<string[]>([]);
  const [isPaymentConfirmationDialogOpen, setIsPaymentConfirmationDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [, dispatch] = useContext(GlobalContext);
  const { enqueueSnackbar } = useSnackbar();

  const onSelectRow = useCallback(
    (event: React.MouseEvent<HTMLElement>, id: string) => {
      event.stopPropagation();
      setSelectedPaymentConfirmations(prevState =>
        selectedPaymentConfirmations.includes(id)
          ? [...prevState.filter(t => t !== id)]
          : [...prevState, id],
      );
    },
    [selectedPaymentConfirmations],
  );

  const handleSelectDeselectAll = () => {
    if (selectedPaymentConfirmations.length !== paymentConfirmations.length) {
      setSelectedPaymentConfirmations(
        paymentConfirmations.map(paymentConfirmation => paymentConfirmation.id),
      );
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
      selectedPaymentConfirmations.map(paymentConfirmationId =>
        deletePaymentConfirmation(paymentConfirmationId),
      );

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
      const collectionRef = firebase.firestore().collection('payment-confirmation-config');
      try {
        const exitingPaymentConfirmation = await collectionRef.doc(id).get();
        const dataCopy = exitingPaymentConfirmation.data() as CustomerSettingsRule;
        if (exitingPaymentConfirmation) {
          const ref = collectionRef.doc();
          const createdAt = firebase.firestore.Timestamp.fromDate(
            addSeconds(dataCopy.createdAt.toDate(), 2),
          );
          await ref.set({ ...dataCopy, id: ref.id, createdAt });
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar(<Typography color="inherit"> {error.message}!</Typography>, {
          variant: 'error',
          autoHideDuration: 3000,
        });
      }
    },
    [enqueueSnackbar],
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
            addButtonLabel={'Add customer setting'}
            deleteButtonLabel={
              selectedPaymentConfirmations.length === 1 ? `Delete setting` : `Delete settings`
            }
            labelWhenNotSelected={''}
          />
          <Table aria-label="a dense table">
            <colgroup>
              <col style={{ width: '2.5%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '15%' }} />
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
                <TableCell align="left">Direction</TableCell>
                <TableCell align="left">Client</TableCell>
                <TableCell align="left">Contact</TableCell>
                <TableCell align="left">Statistic client</TableCell>
                <TableCell align="left">Send message</TableCell>
                <TableCell align="left" />
              </TableRow>
            </TableHead>
            <TableBody>
              {paymentConfirmations.map((paymentConfirmation, index) => (
                <TeamPaymentConfirmationCustomerSettingsRow
                  paymentConfirmation={paymentConfirmation}
                  key={`payment-confirmation-${paymentConfirmation.id}-${index}`}
                  selected={
                    paymentConfirmation.id
                      ? selectedPaymentConfirmations.includes(paymentConfirmation.id)
                      : false
                  }
                  onSelectRow={event =>
                    paymentConfirmation.id && onSelectRow(event, paymentConfirmation.id)
                  }
                  onCopy={handleCopy}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <TeamsPaymentConfirmationCustomerSettingsAddDialog
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

export default TeamsPaymentConfirmationCustomerSettingsTable;
