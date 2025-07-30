import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  createStyles,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Typography,
} from '@material-ui/core';
import {
  ActivityChangeType,
  ActivityLogUserData,
  ChecklistItem,
  ChecklistItemValueDocument,
  CustomerAction,
  ShortChecklistItem,
  Stage,
} from '../../bookings/checklist/ChecklistItemModel';
import {
  ActivityLogItem,
  ActivityType,
  PaymentActivityData,
} from '../../bookings/checklist/ActivityModel';
import { MentionItem } from 'react-mentions';
import { flow, isNil, omitBy } from 'lodash/fp';
import { Fragment, useCallback, useContext, useMemo, useState } from 'react';
import UserRecordContext from '../../../contexts/UserRecordContext';
import { useSnackbar } from 'notistack';
import firebase from '../../../firebase';
import DoneIcon from '@material-ui/icons/Done';
import { BookingRequest } from '../../../model/BookingRequest';
import { useDropzone } from 'react-dropzone';
import { StoredDocument } from '../../../model/Booking';
import { makeContentDispositionFileName } from '../../DropZone';
import { fileWithExt } from '../../bookings/checklist/ChecklistItemRow';
import useGlobalAppState from '../../../hooks/useGlobalAppState';
import { SAVED_ACTION_SNACKBAR } from '../../../store/types/globalAppState';
import BookingRequestDocumentList from '../BookingRequestDocumentList';
import AddCommentIcon from '@material-ui/icons/AddComment';
import { useActivityLogState } from '../../bookings/checklist/ActivityLogContext';
import Alert from '@material-ui/lab/Alert';
import { tryGetErrorMessage } from '../../../utilities/errorHelper';

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
    tinyIconButton: {
      '& svg': {
        fontSize: 10,
      },
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

const checklistDocumentsRef = (path: string) =>
  firebase.firestore().collection('bookings-requests').doc(path).collection('documents');

const BookingRequestChecklistRow = ({
  bookingRequest,
  checklistItem,
  isAdmin,
  isCommentIconHidden,
}: BookingRequestChecklistRowProp) => {
  const classes = useStyles();
  const userRecord = useContext(UserRecordContext);
  const { enqueueSnackbar } = useSnackbar();
  const [, dispatch] = useGlobalAppState();
  const activityLogContext = useActivityLogState();

  const getActivityLogUserData = useCallback(
    (): ActivityLogUserData =>
      ({
        firstName: userRecord?.firstName,
        lastName: userRecord?.lastName,
        alphacomClientId: userRecord?.alphacomClientId,
        alphacomId: userRecord?.alphacomId,
        emailAddress: userRecord?.emailAddress,
      }) as ActivityLogUserData,
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
          enqueueSnackbar(<Typography color="inherit"> {tryGetErrorMessage(error)}!</Typography>, {
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
      value:
        | ChecklistItemValueDocument[]
        | undefined
        | boolean
        | ConfirmedByCustomer
        | Stage[]
        | CustomerAction,
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
      dispatch({
        type: SAVED_ACTION_SNACKBAR,
        storeToFirebase: () => checklistItemCheckedHandler(value),
      });
    },
    [checklistItemCheckedHandler, dispatch],
  );

  const checklistItemFileAddedHandler = useCallback(
    (addedFiles: ChecklistItemValueDocument[]) => {
      const batch = firebase.firestore().batch();
      addedFiles.forEach(doc =>
        batch.set(
          checklistDocumentsRef(`/${bookingRequest.id}/checklist/${checklistItem.id}`).doc(),
          doc,
        ),
      );
      return batch
        .commit()
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
    return ['bookings-requests', bookingRequest.id, 'checklist', checklistItem.id].join('/');
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
              enqueueSnackbar(
                <Typography color="inherit">Failed to upload file - {error.message}!</Typography>,
                {
                  variant: 'error',
                  autoHideDuration: 1000,
                },
              );
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
    [
      checklistItem,
      saveFiles,
      storeActivity,
      checklistItemFileAddedHandler,
      getActivityLogUserData,
    ],
  );

  const handleMention = useCallback(() => {
    activityLogContext.setState({ checklistReference: checklistItem });
  }, [activityLogContext]);

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => onDrop(acceptedFiles),
    noClick: true,
  });

  return (
    <Fragment>
      <Box
        className={isDragActive ? classes.dropZone : classes.root}
        display="flex"
        flexDirection="column"
        id={checklistItem.id}
        flex={1}
        {...getRootProps()}
      >
        <ListItem id={'checklistItemRow_' + checklistItem.id}>
          <a id={checklistItem.id} />
          <ListItemIcon>
            {isAdmin ? (
              <Checkbox
                checked={checklistItem.checked || false}
                disabled={!isAdmin}
                onChange={event => handleCheckboxChange(event.target.checked)}
              />
            ) : (
              checklistItem.checked && <DoneIcon />
            )}
          </ListItemIcon>
          <ListItemText primary={checklistItem.label} />
          {!isCommentIconHidden && (
            <ListItemSecondaryAction>
              <IconButton
                id="mentionIconChecklist"
                size="small"
                aria-label="Add Comment"
                onClick={handleMention}
              >
                <AddCommentIcon
                  style={{ color: (checklistItem.mentionCount || 0) > 0 ? '#F7BC06' : 'inherit' }}
                />
              </IconButton>
            </ListItemSecondaryAction>
          )}

          <input {...getInputProps()} />
        </ListItem>

        {uploadProgress > 0 && (
          <Alert
            severity="info"
            icon={<CircularProgress size={22} variant="determinate" value={uploadProgress} />}
            action={
              <Button
                aria-label="cancel upload"
                color="inherit"
                size="small"
                onClick={() => {
                  uploadTask?.cancel();
                  setUploadTask(undefined);
                  setUploadProgress(0);
                }}
              >
                Cancel Upload
              </Button>
            }
          >
            Uploading...
          </Alert>
        )}

        <BookingRequestDocumentList
          collectionPath={`bookings-requests/${bookingRequest.id}/checklist/${checklistItem.id}/documents`}
          storageBasePath={storageBasePath}
          activityPath={`bookings-requests/${bookingRequest.id}/activity`}
          additionalActivityFields={{ checklistItem: checklistItem }}
          additionalMentionFields={{ checklistReference: checklistItem }}
          documentsCount={checklistItem.documentsCount}
        />
      </Box>
    </Fragment>
  );
};

interface BookingRequestChecklistRowProp {
  checklistItem: ChecklistItem;
  isAdmin: boolean | undefined;
  bookingRequest: BookingRequest;
  comparableDocuments: ChecklistItemValueDocument[];
  isCommentIconHidden?: boolean;
}

interface ConfirmedByCustomer {
  by: ActivityLogUserData;
  at: Date;
}

export default BookingRequestChecklistRow;
