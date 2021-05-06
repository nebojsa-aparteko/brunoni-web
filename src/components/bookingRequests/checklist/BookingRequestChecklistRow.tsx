import { Box, Checkbox, createStyles, makeStyles, Typography } from '@material-ui/core';
import {
  ActivityChangeType,
  ActivityLogUserData,
  ChecklistItem,
  ChecklistItemValueDocument,
  CustomerAction,
  ShortChecklistItem,
  Stage,
} from '../../bookings/checklist/ChecklistItemModel';
import { ActivityLogItem, ActivityType, PaymentActivityData } from '../../bookings/checklist/ActivityModel';
import { MentionItem } from 'react-mentions';
import { flow, isNil, omitBy } from 'lodash/fp';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import UserRecordContext from '../../../contexts/UserRecordContext';
import { useSnackbar } from 'notistack';
import firebase from '../../../firebase';
import DoneIcon from '@material-ui/icons/Done';
import { BookingRequest } from '../../../model/BookingRequest';
import { useDropzone } from 'react-dropzone';
import { StoredDocument } from '../../../model/Booking';
import { makeContentDispositionFileName } from '../../DropZone';
import { fileWithExt } from '../../bookings/checklist/ChecklistItemRow';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      flexGrow: 1,
      '&:focus': {
        outline: 'none',
      },
    },
    dropZone: {
      border: '1px dashed #ccc',
      cursor: 'pointer',
      borderColor: '#999',
      '&:focus': {
        outline: 'none',
      },
    },
    dropZoneHint: {
      backgroundColor: 'rgba(0,0,0,0.6)',
    },
  }),
);

export const createActivityObject = (data: {
  changeType: ActivityChangeType;
  by: ActivityLogUserData;
  checklistItem?: ChecklistItem;
  documents?: ChecklistItemValueDocument[];
  stage?: Stage;
  internal?: boolean;
  isAccountingActivity?: boolean;
  paymentReference?: string;
  paymentActivityData?: PaymentActivityData;
  type?: ActivityType;
  comment?: string;
  mentions?: MentionItem[];
  addedUsers?: ActivityLogUserData[];
  removedUsers?: ActivityLogUserData[];
}): ActivityLogItem => {
  const {
    by,
    changeType,
    internal,
    checklistItem,
    paymentReference,
    paymentActivityData,
    documents,
    stage,
    isAccountingActivity,
    type,
    comment,
    mentions,
    addedUsers,
    removedUsers,
  } = data;
  return flow(omitBy(isNil))({
    changeType: changeType,
    by: by,
    at: new Date(),
    type: type || ActivityType.ACTIVITY,
    isInternal: internal,
    checklistItem: checklistItem
      ? omitBy(isNil)({
          id: checklistItem?.id,
          label: checklistItem?.label,
          checked: checklistItem?.checked,
        } as ShortChecklistItem)
      : undefined,
    documents: documents,
    stage: stage,
    comment: comment,
    mentions: mentions,
    isAccountingActivity: !!isAccountingActivity,
    paymentReference: paymentReference,
    paymentActivityData: paymentActivityData,
    addedUsers: addedUsers,
    removedUsers: removedUsers,
  } as ActivityLogItem);
};
const addActivityItem = (bookingId: string, activityLog: ActivityLogItem) => {
  return firebase
    .firestore()
    .collection('bookings-requests')
    .doc(bookingId)
    .collection('activity')
    .doc()
    .set(activityLog);
};
const BookingRequestChecklistRow = ({ bookingRequest, checklistItem, isAdmin }: BookingRequestChecklistRowProp) => {
  const classes = useStyles();
  const userRecord = useContext(UserRecordContext);
  const { enqueueSnackbar } = useSnackbar();

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

  const storeActivity = useCallback(
    (checklistItemActivityHandler: () => Promise<void>) => {
      checklistItemActivityHandler()
        .then(_ => {
          enqueueSnackbar(<Typography color="inherit">Saved changes!</Typography>, {
            variant: 'success',
            autoHideDuration: 1000,
          });
        })
        .catch(error => {
          console.error('error storing activity', error);
          enqueueSnackbar(<Typography color="inherit"> {error.message}!</Typography>, {
            variant: 'error',
            autoHideDuration: 3000,
          });
        });
    },
    [enqueueSnackbar],
  );

  const saveChecklistChanges = useCallback(
    (
      field: string,
      value: ChecklistItemValueDocument[] | undefined | boolean | ConfirmedByCustomer | Stage[] | CustomerAction,
    ) => {
      return firebase
        .firestore()
        .collection('bookings-requests')
        .doc(bookingRequest?.id)
        .collection('checklist')
        .doc(checklistItem?.id)
        .update(field, value);
    },
    [bookingRequest, checklistItem],
  );

  const checklistItemCheckedHandler = useCallback(
    (checked: boolean) => {
      return saveChecklistChanges('checked', checked).then(_ =>
        addActivityItem(
          bookingRequest.id!,
          createActivityObject({
            changeType: ActivityChangeType.CHECKED,
            by: getActivityLogUserData(),
            checklistItem: { ...checklistItem, checked },
          }),
        ),
      );
    },
    [bookingRequest?.id, checklistItem, getActivityLogUserData, saveChecklistChanges],
  );

  const handleCheckboxChange = useCallback(
    (value: boolean) => {
      storeActivity(() => checklistItemCheckedHandler(value));
    },
    [checklistItemCheckedHandler, storeActivity],
  );

  const checklistItemFileAddedHandler = useCallback(
    (addedFiles: ChecklistItemValueDocument[]) => {
      const newDocuments = (checklistItem.valuesAdmin || []).concat(addedFiles);
      return saveChecklistChanges('valuesAdmin', newDocuments)
        .then(_ =>
          addActivityItem(
            bookingRequest!.id!,
            createActivityObject({
              changeType: ActivityChangeType.ADD_FILE,
              by: getActivityLogUserData(),
              checklistItem: checklistItem,
              documents: addedFiles,
            }),
          ),
        )
        .catch(error => console.error('Error saving new document list', error));
    },
    [bookingRequest, checklistItem, getActivityLogUserData, saveChecklistChanges],
  );
  const storageBasePath = useMemo((): string => {
    return ['booking-documents', 'clients', '/', 'bookings', '', checklistItem.id].join('/');
  }, [bookingRequest, checklistItem]);

  // status indicators
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTask, setUploadTask] = useState<firebase.storage.UploadTask>(); // add some control to uploads so that users can cancel

  const saveFiles = useCallback(
    async (files: File[]): Promise<any> => {
      const uploadFile = async (file: File): Promise<any> => {
        return new Promise((resolve, reject) => {
          const fileWithExtension = fileWithExt(file.name);
          const storedFileName = `${fileWithExtension.name}_${new Date().getTime()}.${fileWithExtension.ext}`;
          let path = [storageBasePath, storedFileName].join('/');

          let storageRef = firebase.storage().ref(encodeURI(path));
          let uploadTask = storageRef.put(file);
          setUploadTask(uploadTask);

          uploadTask.on(
            firebase.storage.TaskEvent.STATE_CHANGED,
            snapshot => {
              console.log('progress: ', (snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              // in progress
              // if(snapshot.state === firebase.storage.TaskState.RUNNING) {
              //   // ex. calculate progress
              // }
            },
            error => {
              setUploadProgress(0);
              reject(error);
              enqueueSnackbar(<Typography color="inherit">Failed to upload file - {error.message}!</Typography>, {
                variant: 'error',
                autoHideDuration: 1000,
              });
            },
            () => {
              setUploadProgress(0);
              // success
              storageRef.updateMetadata({
                contentDisposition: makeContentDispositionFileName(checklistItem, undefined, file),
              });
              uploadTask.snapshot.ref.getDownloadURL().then((downloadURL: string) => {
                resolve({ url: downloadURL, name: file.name, storedName: storedFileName });
              });
            },
          );
        });
      };

      const requests = files.map((file: File) => {
        return uploadFile(file).then(storedItem => {
          return storedItem;
        });
      });

      return Promise.all(requests);
    },
    [storageBasePath, checklistItem, enqueueSnackbar],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      saveFiles(acceptedFiles)
        .then((documents: StoredDocument[]) => {
          console.log(documents, 'DOCUMENTS');
          const values = documents.map(item => {
            return {
              uploadedBy: getActivityLogUserData(),
              uploadedAt: new Date(),
              name: item.name,
              url: item.url,
              storedName: item.storedName,
            } as ChecklistItemValueDocument;
          });
          storeActivity(() => checklistItemFileAddedHandler(values));
        })
        .catch(err => {
          console.error(`Error while storing files ${JSON.stringify(checklistItem, null, 2)}`, err);
        });
    },
    [checklistItem, saveFiles, storeActivity, checklistItemFileAddedHandler, getActivityLogUserData],
  );

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => onDrop(acceptedFiles),
    noClick: true,
  });

  return (
    <Box
      id={'checklistItemRow_' + checklistItem.id}
      display="flex"
      justifyContent="space-between"
      my={1}
      flexDirection={isAdmin && checklistItem.valuesAdmin?.length === 0 ? 'row' : 'column'}
    >
      <Box
        className={isDragActive ? classes.dropZone : classes.root}
        display="flex"
        flexDirection="column"
        id={checklistItem.id}
        flex={1}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <Box display="flex" flexDirection="row">
          <Box flexDirection="row" alignContent="center">
            <a id={checklistItem.id} />
            {isAdmin ? (
              <Checkbox
                defaultChecked={checklistItem.checked}
                disabled={!isAdmin}
                onChange={event => handleCheckboxChange(event.target.checked)}
              />
            ) : (
              checklistItem.checked && <DoneIcon />
            )}
            <Typography display="inline">{checklistItem.label}</Typography>
          </Box>
          <Box flex="1" />
        </Box>
      </Box>
    </Box>
  );
};

interface BookingRequestChecklistRowProp {
  checklistItem: ChecklistItem;
  isAdmin: boolean | undefined;
  bookingRequest: BookingRequest;
  comparableDocuments: ChecklistItemValueDocument[];
}

interface ConfirmedByCustomer {
  by: ActivityLogUserData;
  at: Date;
}

export default BookingRequestChecklistRow;
