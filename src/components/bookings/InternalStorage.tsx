import React, { useCallback, useContext, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  LinearProgress,
  List,
  makeStyles,
  Typography,
} from '@material-ui/core';
import { useDropzone } from 'react-dropzone';
import { ActivityChangeType, ActivityLogUserData, ChecklistItemValueDocument } from './checklist/ChecklistItemModel';
import { orderBy } from 'lodash/fp';
import InternalStorageItem from './InternalStorageItem';
import firebase from '../../firebase';
import { fileWithExt } from './checklist/ChecklistItemRow';
import { useSnackbar } from 'notistack';
import UserRecordContext from '../../contexts/UserRecordContext';
import useFirestoreCollection from '../../hooks/useFirestoreCollection';
import CloseIcon from '@material-ui/icons/Close';
import { useActivityLogState } from './checklist/ActivityLogContext';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import { ActivityLogItem, ActivityType } from './checklist/ActivityModel';
import { showCrispChat } from '../../index';
import BookingRequestComparisonDialog from '../bookingRequests/checklist/BookingRequestComparisonDialog';

const useStyles = makeStyles(() => ({
  rootEmpty: {
    flexGrow: 1,
    border: '1px dashed #ccc',
    cursor: 'pointer',
    borderColor: '#999',
    '&:focus': {
      outline: 'none',
    },
  },
  root: {
    flexGrow: 1,
    '&:focus': {
      outline: 'none',
    },
  },
  dropZone: {
    border: '1px solid #ccc',
    cursor: 'pointer',
    borderColor: '#999',
    '&:focus': {
      outline: 'none',
    },
  },
  documentList: {
    width: '100%',
    // backgroundColor: theme.palette.background.paper,
  },
  tinyIconButton: {
    '& svg': {
      fontSize: 10,
    },
  },
}));

export const saveFilesToFirestore = (collection: string, id: string, files: ChecklistItemValueDocument) =>
  firebase
    .firestore()
    .collection(collection)
    .doc(id)
    .collection('internal-documents')
    .doc()
    .set(files);

const deleteFileFromFirebase = (collection: string, deletedFile: ChecklistItemValueDocument, id: string) =>
  firebase
    .firestore()
    .collection(collection)
    .doc(id)
    .collection('internal-documents')
    .doc(deletedFile?.id)
    .delete();

const addActivity = (activity: ActivityLogItem, collection: string, id: string) =>
  firebase
    .firestore()
    .collection(collection)
    .doc(id)
    .collection('activity')
    .doc()
    .set(activity);
const InternalStorage: React.FC<Props> = ({
  id,
  collection,
  isInternal = true,
  label = 'Internal documents',
  cardMargin = 2,
  dndLabel,
  showHeader,
  bookingRequestId,
}) => {
  const classes = useStyles();
  const query = useCallback(q => q.where('isInternal', '==', isInternal).orderBy('uploadedAt', 'desc'), [isInternal]);
  // status indicators
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTask, setUploadTask] = useState<firebase.storage.UploadTask>(); // add some control to uploads so that users can cancel
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<ChecklistItemValueDocument | undefined>(undefined);

  const filesCollection = useFirestoreCollection(collection, query, id, 'internal-documents');
  const activityLogContext = useActivityLogState();

  const normalizedFiles =
    (filesCollection?.docs.map(doc => {
      return { ...doc.data(), id: doc.id } as ChecklistItemValueDocument;
    }) as ChecklistItemValueDocument[]) || [];

  const { enqueueSnackbar } = useSnackbar();
  const userRecord = useContext(UserRecordContext);

  const handleDialogClose = useCallback(() => {
    setSelectedDocument(undefined);
    showCrispChat(true);
    setIsDialogOpen(false);
  }, [setIsDialogOpen]);

  const handleDialogOpen = useCallback(
    (document: ChecklistItemValueDocument) => {
      setSelectedDocument(document);
      showCrispChat(false);
      setIsDialogOpen(true);
    },
    [setIsDialogOpen],
  );

  const storageBasePath = useMemo((): string => {
    return [`${collection}-documents-internal`, id].join('/');
  }, [id, collection]);
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
                contentDisposition: `attachment; filename=${file.name}`,
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
    [storageBasePath, enqueueSnackbar],
  );

  const onDeleteFile = useCallback(
    (item: ChecklistItemValueDocument, setRemovalInProgress: any) => {
      setRemovalInProgress(true);
      try {
        const path = [storageBasePath, `${item.storedName}`].join('/');
        const storageRef = firebase.storage().ref();
        const documentRef = storageRef.child(encodeURI(path));

        documentRef
          .delete()
          .then(() => {
            console.debug('File deleted from storage ', item);
          })
          .catch(error => {
            console.error('Failed to remove item - {error.message}', error);
          })
          .finally(() => {
            // remove item from the list in any case since if it is an error with the storage means file is alrady out
            setRemovalInProgress(false);
            deleteFileFromFirebase(collection, item, id)
              .then(_ => {
                console.log('File deleted', collection, item, id);
                return new Promise<ChecklistItemValueDocument>(resolve => resolve(item));
              })
              .then(item => addActivity(createActivity([item], ActivityChangeType.DELETE_FILE), collection, id))
              .catch(error => {
                console.error('failed to update deleted items', error);
                enqueueSnackbar(<Typography color="inherit">Failed to delete item - {error.message}</Typography>, {
                  variant: 'error',
                  autoHideDuration: 1000,
                });
              });
          });
      } catch (error) {
        setRemovalInProgress(false);
        enqueueSnackbar(<Typography color="inherit">Failed to remove item - {error.message}!</Typography>, {
          variant: 'error',
          autoHideDuration: 1000,
        });
      }
    },
    [storageBasePath, collection, id],
  );

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

  const createActivity = useCallback(
    (documents: ChecklistItemValueDocument[], activityType: ActivityChangeType) =>
      ({
        at: new Date(),
        by: getActivityLogUserData(),
        type: ActivityType.ACTIVITY,
        isInternal: true,
        documents: documents,
        changeType: activityType,
      } as ActivityLogItem),
    [getActivityLogUserData, userRecord],
  );
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      saveFiles(acceptedFiles)
        .then((documents: ChecklistItemValueDocument[]) => {
          const values = documents.map(
            item =>
              ({
                uploadedBy: getActivityLogUserData(),
                uploadedAt: new Date(),
                name: item.name,
                url: item.url,
                storedName: item.storedName,
                isInternal,
              } as ChecklistItemValueDocument),
          );
          values.map(value => saveFilesToFirestore(collection, id, value));
          return new Promise<ChecklistItemValueDocument[]>(resolve => resolve(documents));
        })
        .then(documents => addActivity(createActivity(documents, ActivityChangeType.ADD_FILE), collection, id))
        .catch(err => {
          console.error(`Error while storing files ${JSON.stringify(id, null, 2)}`, err);
        });
    },
    [saveFiles, id, collection, getActivityLogUserData],
  );
  const onMentionFile = (item: ChecklistItemValueDocument) =>
    activityLogContext.setState({ documentReference: item, internal: true });
  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
    noClick: normalizedFiles.length > 0,
  });
  return (
    <React.Fragment>
      {!(normalizedFiles && normalizedFiles.length > 0) && showHeader && (
        <Box m={2} ml={3}>
          <Typography variant={'h5'}>{label}</Typography>
        </Box>
      )}
      <Box
        p={!(normalizedFiles && normalizedFiles.length > 0) && showHeader && 2}
        pb={!(normalizedFiles && normalizedFiles.length > 0) && showHeader && 2}
      >
        <Box
          {...getRootProps()}
          className={
            isDragActive ? classes.dropZone : normalizedFiles && normalizedFiles[0] ? classes.root : classes.rootEmpty
          }
          my={cardMargin}
          py={normalizedFiles && normalizedFiles[0] ? 0 : 1}
          display="flex"
          justifyContent="center"
          flexDirection="column"
        >
          <input {...getInputProps()} />
          {uploadProgress > 0 && (
            <Box display="flex">
              <div style={{ width: '100%', paddingTop: '14px' }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
              </div>
              <IconButton
                className={classes.tinyIconButton}
                aria-label="cancel upload"
                onClick={() => {
                  uploadTask?.cancel();
                  setUploadTask(undefined);
                  setUploadProgress(0);
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          )}

          {normalizedFiles && normalizedFiles.length > 0 ? (
            <Card style={{ backgroundColor: isInternal ? '#eee' : '#fff' }}>
              <CardHeader
                title={label}
                action={
                  <IconButton size="small" aria-label="Add Comment" onClick={open}>
                    <AttachFileIcon />
                  </IconButton>
                }
              />
              <CardContent>
                <List className={classes.documentList}>
                  {(orderBy('uploadedAt', 'desc')(normalizedFiles) as ChecklistItemValueDocument[]).map(item => (
                    <InternalStorageItem
                      key={`chklistitem-${item.storedName}`}
                      item={item}
                      handleDelete={onDeleteFile}
                      handleMention={onMentionFile}
                      handleDialogOpen={handleDialogOpen}
                    />
                  ))}
                </List>
              </CardContent>
            </Card>
          ) : (
            <Box display="flex" justifyContent="center">
              <Typography>{dndLabel || "Drag 'n' Drop files or click here"}</Typography>
            </Box>
          )}
        </Box>
        {bookingRequestId && selectedDocument && (
          <BookingRequestComparisonDialog
            document={selectedDocument}
            isOpen={isDialogOpen}
            handleClose={handleDialogClose}
            bookingRequestId={bookingRequestId}
          />
        )}
      </Box>
    </React.Fragment>
  );
};

export default InternalStorage;

interface Props {
  id: string;
  collection: string;
  isInternal?: boolean;
  label?: string;
  cardMargin?: number;
  dndLabel?: string;
  showHeader?: boolean;
  bookingRequestId?: string;
}
