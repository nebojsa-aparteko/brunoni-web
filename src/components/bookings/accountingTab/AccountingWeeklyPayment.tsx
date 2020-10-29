import WeeklyPayment, { Status } from '../../../model/WeeklyPayment';
import {
  Box,
  Button,
  Container,
  ExpansionPanel,
  ExpansionPanelActions,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Typography,
} from '@material-ui/core';
import { formatDateSafe } from '../../../utilities/formattingHelpers';
import safeInvoke from '../../../utilities/safeInvoke';
import currencyFormatter from '../../../utilities/currencyFormatter';
import DocumentListItem from '../checklist/DocumentListItem';
import {
  ActivityChangeType,
  ActivityLogUserData,
  DocumentValue,
  DocumentValueStatus,
} from '../checklist/ChecklistItemModel';
import DropZone from '../../DropZone';
import React, { useCallback, useContext, useMemo } from 'react';
import { Booking } from '../../../model/Booking';
import { editRestriction } from '../checklist/CheckList';
import { addActivityItem } from '../checklist/ActivityLogContainer';
import { createActivityObject } from '../checklist/ChecklistItemRow';
import firebase from '../../../firebase';
import UserRecordContext from '../../../contexts/UserRecordContext';
import { useSnackbar } from 'notistack';
import useAccountingDocuments from '../../../hooks/useAccountingDocuments';
import ChartsCircularProgress from '../../dashboard/ChartsCircularProgress';

const addAccountingDocument = (file: DocumentValue, paymentReference: string) => {
  return firebase
    .firestore()
    .collection('weeklyPayment')
    .doc(paymentReference)
    .collection('accounting-documents')
    .doc()
    .set(file);
};

const deleteAccountingDocument = (file: DocumentValue, paymentReference: string) => {
  return firebase
    .firestore()
    .collection('weeklyPayment')
    .doc(paymentReference)
    .collection('accounting-documents')
    .doc(file.id)
    .delete();
};

const changeAccountingDocument = (file: DocumentValue, bookingId: string) => {
  return firebase
    .firestore()
    .collection('booking-documents')
    .doc(bookingId)
    .collection('accounting-documents')
    .doc(file.id)
    .update(file);
};

const AccountingWeeklyPayment = ({ payment, booking }: AccountingWeeklyPaymentProps) => {
  const userRecord = useContext(UserRecordContext);
  const accountingDocuments = useAccountingDocuments(payment.reference);
  const { enqueueSnackbar } = useSnackbar();

  const storageBasePath = useMemo((): string => {
    return ['booking-documents', 'clients', booking.ForwAdrId, 'bookings', booking.id, 'accounting-documents'].join(
      '/',
    );
  }, [booking]);

  const getActivityLogUserData = useCallback(
    (): ActivityLogUserData =>
      ({
        firstName: userRecord?.firstName,
        lastName: userRecord?.lastName,
        alphacomClientId: userRecord?.alphacomClientId,
        alphacomId: userRecord?.alphacomId,
        emailAddress: userRecord?.emailAddress,
      } as ActivityLogUserData),
    [userRecord],
  );

  const handleAddFile = useCallback(
    (addedFiles: DocumentValue[]) => {
      return Promise.all(addedFiles.map(file => addAccountingDocument(file, payment.reference)))
        .then(_ =>
          addActivityItem(
            booking!.id,
            createActivityObject(
              ActivityChangeType.ADD_FILE,
              getActivityLogUserData(),
              undefined,
              addedFiles,
              undefined,
              undefined,
              true,
            ),
          ),
        )
        .catch(error => console.error('Error saving new document list', error));
    },
    [booking, getActivityLogUserData],
  );

  const handleDeleteFile = useCallback(
    (deletedFile: DocumentValue) => {
      return Promise.resolve(deleteAccountingDocument(deletedFile, payment.reference))
        .then(_ =>
          addActivityItem(
            booking!.id,
            createActivityObject(
              ActivityChangeType.DELETE_FILE,
              getActivityLogUserData(),
              undefined,
              [deletedFile],
              undefined,
              undefined,
              true,
            ),
          ),
        )
        .catch(error => console.error('Error during document deletion', error));
    },
    [booking, getActivityLogUserData],
  );

  const storeAccountingActivity = (accountingActivityHandler: () => Promise<void>) => {
    accountingActivityHandler()
      .then(_ => {
        enqueueSnackbar(<Typography color="inherit">Saved changes!</Typography>, {
          variant: 'success',
          autoHideDuration: 1500,
        });
      })
      .catch(error => {
        console.error('error storing activity', error);
        enqueueSnackbar(<Typography color="inherit"> {error.message}!</Typography>, {
          variant: 'error',
          autoHideDuration: 3000,
        });
      });
  };

  const handleDocumentStatusChange = (item: DocumentValue, status: DocumentValueStatus) => {
    if (item.status && !editRestriction(item.status!.at as Date)) {
      return enqueueSnackbar(
        <Typography color="inherit">
          {`Failed to edit item - You cant change status after ${process.env.EDIT_RESTRICTION_TIME} from last change!`}
        </Typography>,
        {
          variant: 'error',
          autoHideDuration: 1000,
        },
      );
    }
    const newItem: DocumentValue = { ...item, status: status };

    storeAccountingActivity(() =>
      changeAccountingDocument(newItem, booking.id).then(_ =>
        addActivityItem(
          booking!.id,
          createActivityObject(
            ActivityChangeType.DOCUMENT_STATUS_CHANGED,
            getActivityLogUserData(),
            undefined,
            [newItem],
            undefined,
            true,
            true,
          ),
        ),
      ),
    );
  };

  return (
    <ExpansionPanel key={payment.reference} style={{ margin: 4 }}>
      <ExpansionPanelSummary style={{ backgroundColor: 'rgba(198,238,241,0.24)', display: 'flex' }}>
        <Box flex={1} display="flex" flexDirection="row" justifyContent="space-between">
          <Typography variant={'h5'}>
            {formatDateSafe(safeInvoke('toDate')(payment.payDate), 'd. MMMM yyyy.')}
          </Typography>
          <Typography variant={'h5'}>{'Amount: ' + currencyFormatter(payment.currency)(payment.amount)}</Typography>
          <Typography
            variant={'h5'}
            style={{ fontWeight: 700, color: payment.status === Status.PAID ? 'rgba(0,200,81)' : '#000' }}
          >
            {payment.status}
          </Typography>
        </Box>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <Box display="flex" flex={1} flexDirection="column" px={0} style={{ listStyle: 'none' }}>
          <Box p={2}>
            <Typography variant={'h5'}>{'Reference Id: ' + payment.reference}</Typography>
            <Typography variant={'h5'}>{'Type: ' + payment.debitCredit}</Typography>
          </Box>
          {!accountingDocuments ? (
            <Container>
              <ChartsCircularProgress />
            </Container>
          ) : (
            accountingDocuments.map(item => (
              <DocumentListItem
                key={item.id}
                item={item}
                booking={booking}
                storageBasePath={storageBasePath}
                changeStatus={(item: DocumentValue, status: DocumentValueStatus) =>
                  handleDocumentStatusChange(item, status)
                }
                deleteFile={(item: DocumentValue) => handleDeleteFile(item)}
                internal={true}
                isAccountingDocument={true}
                markAsFinal={() => {}}
                comparableDocuments={[]}
                selectForComparison={() => {}}
              />
            ))
          )}

          <DropZone
            storageBasePath={storageBasePath}
            internal={false}
            onUpload={values => storeAccountingActivity(() => handleAddFile(values))}
            onDelete={() => {}}
          />
        </Box>
      </ExpansionPanelDetails>
      <ExpansionPanelActions>
        <Button color="primary" variant="contained">
          Approve Payment
        </Button>
        <Button color="primary" variant="outlined">
          Postpone Payment
        </Button>
      </ExpansionPanelActions>
    </ExpansionPanel>
  );
};

interface AccountingWeeklyPaymentProps {
  payment: WeeklyPayment;
  booking: Booking;
}

export default AccountingWeeklyPayment;
