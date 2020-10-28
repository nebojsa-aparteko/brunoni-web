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
import React, { useCallback, useContext, useMemo } from 'react';
import { Booking } from '../../../model/Booking';
import {
  ActivityChangeType,
  ActivityLogUserData,
  ChecklistItemValueDocument,
  DocumentValue,
  DocumentValueStatus,
} from '../checklist/ChecklistItemModel';
import ChartsCircularProgress from '../../dashboard/ChartsCircularProgress';

import DocumentListItem from '../checklist/DocumentListItem';
import DropZone from '../../DropZone';
import { addActivityItem } from '../checklist/ActivityLogContainer';
import { createActivityObject } from '../checklist/ChecklistItemRow';
import firebase from '../../../firebase';
import UserRecordContext from '../../../contexts/UserRecordContext';
import { useSnackbar } from 'notistack';
import useAccountingDocuments from '../../../hooks/useAccountingDocuments';
import { editRestriction } from '../checklist/CheckList';
import usePaymentOverview from '../../../hooks/usePaymentOverview';
import { formatDateSafe } from '../../../utilities/formattingHelpers';
import safeInvoke from '../../../utilities/safeInvoke';
import currencyFormatter from '../../../utilities/currencyFormatter';
import { Status } from '../../../model/WeeklyPayment';

const addAccountingDocument = (file: DocumentValue, bookingId: string) => {
  return firebase
    .firestore()
    .collection('bookings')
    .doc(bookingId)
    .collection('accounting-documents')
    .doc()
    .set(file);
};

const changeAccountingDocument = (file: DocumentValue, bookingId: string) => {
  return firebase
    .firestore()
    .collection('bookings')
    .doc(bookingId)
    .collection('accounting-documents')
    .doc(file.id)
    .update(file);
};

const AccountingTabContent = ({ booking }: AccountingTabContentProps) => {
  const userRecord = useContext(UserRecordContext);
  const weeklyPayments = usePaymentOverview(booking.id);
  console.log(weeklyPayments);
  const { enqueueSnackbar } = useSnackbar();
  const accountingDocuments = useAccountingDocuments(booking.id);

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

  const accountingFileAddedHandler = useCallback(
    (addedFiles: DocumentValue[]) => {
      return Promise.all(addedFiles.map(file => addAccountingDocument(file, booking.id)))
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

  const storageBasePath = useMemo((): string => {
    return ['booking-documents', 'clients', booking.ForwAdrId, 'bookings', booking.id, 'accounting-documents'].join(
      '/',
    );
  }, [booking]);

  if (!accountingDocuments) {
    return (
      <Container>
        <ChartsCircularProgress />
      </Container>
    );
  }

  return (
    <Box display="flex" flex={1} flexDirection="column" px={0} style={{ listStyle: 'none' }}>
      {weeklyPayments.map(payment => (
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
              {accountingDocuments.map(item => (
                <DocumentListItem
                  key={item.id}
                  item={item}
                  booking={booking}
                  storageBasePath={storageBasePath}
                  changeStatus={(item: ChecklistItemValueDocument, status: DocumentValueStatus) =>
                    handleDocumentStatusChange(item, status)
                  }
                  internal={true}
                  isAccountingDocument={true}
                  markAsFinal={() => {}}
                  comparableDocuments={[]}
                  selectForComparison={() => {}}
                />
              ))}
              <DropZone
                storageBasePath={storageBasePath}
                internal={false}
                onUpload={values => storeAccountingActivity(() => accountingFileAddedHandler(values))}
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
      ))}
    </Box>
  );
};

interface AccountingTabContentProps {
  booking: Booking;
}

export default AccountingTabContent;
