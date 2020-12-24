import React, { Fragment, useCallback, useContext, useMemo, useState } from 'react';
import { orderBy } from 'lodash/fp';
import {
  ActivityChangeType,
  ActivityLogUserData,
  ChecklistItemValueDocument,
  DocumentValue,
} from './ChecklistItemModel';
import DocumentListItem, { DocumentListItemPropsBase } from './DocumentListItem';
import { Button, createStyles, List, makeStyles, Theme, Typography } from '@material-ui/core';
import firebase from '../../../firebase';
import { addActivityItem } from './ActivityLogContainer';
import { createActivityObject } from './ChecklistItemRow';
import UserRecordContext from '../../../contexts/UserRecordContext';
import { useSnackbar } from 'notistack';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    documentList: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
  }),
);

const DocumentList: React.FC<Props> = ({
  checklistItem,
  checklistItemValues,
  booking,
  storageBasePath,
  changeStatus,
  internal,
  markAsFinal,
  otherDocuments,
  selectForComparison,
}) => {
  const classes = useStyles();
  const userRecord = useContext(UserRecordContext);
  const { enqueueSnackbar } = useSnackbar();
  const [shouldShowPrevious, setShouldShowPrevious] = useState<boolean>(false);
  const sortedList = useMemo(() => orderBy('uploadedAt', 'desc')(checklistItemValues) as ChecklistItemValueDocument[], [
    checklistItemValues,
  ]);

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

  const checklistFileDeletedHandler = useCallback(
    (
      deletedFile: ChecklistItemValueDocument | DocumentValue,
      documents?: ChecklistItemValueDocument[] | DocumentValue[],
      internal?: boolean,
    ) => {
      checklistItem
        ? firebase
            .firestore()
            .collection('bookings')
            .doc(booking.id!)
            .collection('checklist')
            .doc(checklistItem.id)
            .update(internal ? 'valuesAdmin' : 'values', documents)
            .then(_ => {
              console.log('File deleted', deletedFile, documents, internal, checklistItem);
              return addActivityItem(
                booking.id!,
                createActivityObject({
                  changeType: ActivityChangeType.DELETE_FILE,
                  by: getActivityLogUserData(),
                  checklistItem: checklistItem,
                  documents: [deletedFile],
                  internal: internal,
                }),
              );
            })
            .catch(error => {
              console.error('failed to update deleted items', error);
              enqueueSnackbar(<Typography color="inherit">Failed to delete item - {error.message}</Typography>, {
                variant: 'error',
                autoHideDuration: 1000,
              });
            })
        : console.log('Error: Checklist item not defined');
    },
    [booking, checklistItem, enqueueSnackbar, getActivityLogUserData],
  );

  return (
    <List className={classes.documentList}>
      {internal || shouldShowPrevious ? (
        sortedList.map(item => (
          <DocumentListItem
            key={item.storedName}
            item={item}
            booking={booking}
            storageBasePath={storageBasePath}
            checklistItem={checklistItem}
            changeStatus={changeStatus}
            deleteFile={checklistFileDeletedHandler}
            internal={internal}
            markAsFinal={markAsFinal}
            otherDocuments={otherDocuments}
            selectForComparison={selectForComparison}
          />
        ))
      ) : sortedList[0] ? (
        <Fragment>
          <DocumentListItem
            key={sortedList[0].storedName}
            item={sortedList[0]}
            booking={booking}
            storageBasePath={storageBasePath}
            checklistItem={checklistItem}
            changeStatus={changeStatus}
            deleteFile={checklistFileDeletedHandler}
            internal={internal}
            markAsFinal={markAsFinal}
            otherDocuments={otherDocuments}
            selectForComparison={selectForComparison}
          />
        </Fragment>
      ) : null}
      {!internal && sortedList.length > 1 && (
        <Button size="small" color="primary" onClick={() => setShouldShowPrevious(prevState => !prevState)}>
          {shouldShowPrevious ? 'Show less' : 'Show more'}
        </Button>
      )}
    </List>
  );
};

export default DocumentList;

export interface Props extends DocumentListItemPropsBase {
  checklistItemValues: ChecklistItemValueDocument[];
}
