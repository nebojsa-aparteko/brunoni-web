import { Box, Container, Typography } from '@material-ui/core';
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

const addAccountingDocument = (file: DocumentValue, bookingId: string) => {
  return firebase
    .firestore()
    .collection('bookings')
    .doc(bookingId)
    .collection('accounting-documents')
    .doc()
    .set(file);
};

const AccountingTabContent = ({ booking }: AccountingTabContentProps) => {
  const userRecord = useContext(UserRecordContext);
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
    <Box display="flex" flexDirection="column" style={{ flex: 1, listStyle: 'none' }}>
      {accountingDocuments.map(item => (
        <DocumentListItem
          key={item.id}
          item={item}
          booking={booking}
          storageBasePath={storageBasePath}
          changeStatus={(item: ChecklistItemValueDocument, status: DocumentValueStatus) => {}}
          internal={true}
          markAsFinal={item => {}}
          comparableDocuments={[]}
          selectForComparison={item => {}}
        />
      ))}
      <DropZone
        storageBasePath={storageBasePath}
        internal={false}
        onUpload={values =>
          accountingFileAddedHandler(values)
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
            })
        }
        onDelete={() => {}}
      />
    </Box>
  );
};

interface AccountingTabContentProps {
  booking: Booking;
}

export default AccountingTabContent;
