import React, { useCallback, useContext, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  createStyles,
  IconButton,
  LinearProgress,
  Link,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import AddCommentIcon from '@material-ui/icons/AddComment';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import { ActivityLogUserData, ActivityText, ChecklistItem, ChecklistItemValueDocument } from './ChecklistItemModel';
import CloseIcon from '@material-ui/icons/Close';
import DeleteIcon from '@material-ui/icons/Delete';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { orderBy } from 'lodash/fp';
import { green } from '@material-ui/core/colors';
import { useSnackbar } from 'notistack';
import useClients from '../../../hooks/useClients';
import { Booking, CheckListDocument } from '../../../model/Booking';
import firebase from '../../../firebase';
import DescriptionIcon from '@material-ui/icons/Description';
import { useDropzone } from 'react-dropzone';
import UserRecordContext from '../../../contexts/UserRecord';
import { capitalCase } from 'change-case';
import { ActivityLogItem, ActivityType } from './ActivityModel';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      '&:focus': {
        outline: 'none',
      },
    },
    documentlist: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
    tableRow: {
      '& td': {
        whiteSpace: 'nowrap',
        padding: '6px 6px',
      },
      ['@media print']: {
        '& td': {
          padding: theme.spacing(0),
          width: '10%',
        },
      },
    },
    itemLabel: {
      whiteSpace: 'normal',
      ['@media print']: {
        whiteSpace: 'nowrap',
      },
    },
    hidePrint: {
      ['@media print']: {
        display: 'none',
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
    buttonLink: {
      textTransform: 'none',
      fontSize: '0.8em',
    },
    fileItemLink: {
      textDecoration: 'none',
      color: 'inherit',
      cursor: 'pointer',
      display: 'flex',
    },
    progressWrapper: {
      margin: theme.spacing(1),
      position: 'relative',
    },
    iconDeleteProgress: {
      color: green[500],
      position: 'absolute',
      top: -6,
      left: -6,
      zIndex: 1,
    },
    tinyIconButton: {
      '& svg': {
        fontSize: 10,
      },
    },
  }),
);

const getFormLink = (): string =>
  process.env.REACT_APP_BRAND === 'brunoni'
    ? 'https://www.brunoni.ch/vgm/online-submission'
    : process.env.REACT_APP_BRAND === 'allmarine'
    ? 'https://allmarine.ch/vgm/online-submission'
    : '#';

const fileWithExt = (fileName: string): { name: string; ext: string } => {
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex > -1
    ? {
        name: fileName.substr(0, dotIndex),
        ext: fileName.substr(dotIndex + 1),
      }
    : {
        name: fileName,
        ext: '',
      };
};

const getActivityObject = (
  field: string,
  value: ChecklistItemValueDocument[] | undefined | boolean | ConfirmedByCustomer,
  userActivity: ActivityLogUserData,
  checklistItemValues: ChecklistItem,
) => {
  const activityObj: ActivityLogItem = {
    comment: '',
    by: userActivity,
    at: new Date(),
    type: ActivityType.ACTIVITY,
    isInternal: false,
  };
  switch (field) {
    case 'checked':
      activityObj.comment = `${capitalCase(userActivity.firstName)} ${capitalCase(userActivity.lastName)}${
        value ? ActivityText.CHECKED : ActivityText.UNCHECKED
      }${checklistItemValues.label}`;
      break;
    case 'values':
      activityObj.comment = `${capitalCase(userActivity.firstName)} ${capitalCase(userActivity.lastName)}${
        (value as ChecklistItemValueDocument[]).length > (checklistItemValues.values?.length || 0)
          ? ActivityText.ADD_FILE
          : ActivityText.DELETE_FILE
      }`;
      break;
    case 'confirmedByCustomer':
      activityObj.comment = `${capitalCase(userActivity.firstName)} ${capitalCase(userActivity.lastName)}${
        ActivityText.DONE_BY_CUSTOMER
      }${checklistItemValues.label}`;
      break;
  }

  return activityObj;
};

const ChecklistItemRow = ({ booking, checklistItem, isAdmin, setMentionedChecklist }: ChecklistItemRowProp) => {
  const classes = useStyles();
  const userRecord = useContext(UserRecordContext);
  const { enqueueSnackbar } = useSnackbar();
  const clients = useClients();
  const client = useMemo(() => clients?.find(client => client.id === booking?.ForwAdrId), [clients, booking]);

  const storageBasePath = useMemo((): string => {
    return ['booking-documents', 'clients', client?.id, 'bookings', booking?.id, checklistItem.id].join('/');
  }, [booking, client, checklistItem]);

  const [item, setItem] = useState(checklistItem);

  const [checklistItemValues, setCheckListItemValues] = useState(checklistItem?.values || []);
  const [checklistItemValuesAdmin, setCheckListItemValuesAdmin] = useState(checklistItem?.valuesAdmin || []);
  const [checklistItemChecked, setChecklistItemChecked] = useState(checklistItem?.checked || false);

  // status indicators
  const [removalInProgress, setRemovalInProgress] = useState(false); //used when file is being removed from the list
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTask, setUploadTask] = useState<firebase.storage.UploadTask>(); // add some control to uploads so that users can cancel

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

  const handleMention = () => {};

  const handleCompleted = () => {
    console.log('Completed');
    saveChecklistChanges('confirmedByCustomer', {
      by: getActivityLogUserData(),
      at: new Date(),
    } as ConfirmedByCustomer);
  };

  const saveChecklistChanges = useCallback(
    (field: string, value: ChecklistItemValueDocument[] | undefined | boolean | ConfirmedByCustomer) => {
      firebase
        .firestore()
        .collection('bookings')
        .doc(booking?.id)
        .collection('checklist')
        .doc(checklistItem.id)
        .update(field, value)
        .then(_ => {
          return firebase
            .firestore()
            .collection('bookings')
            .doc(booking?.id)
            .collection('activity')
            .doc()
            .set(getActivityObject(field, value, getActivityLogUserData(), checklistItem));
        })
        .then(() =>
          enqueueSnackbar(<Typography color="inherit">Saved changes!</Typography>, {
            variant: 'success',
            autoHideDuration: 1000,
          }),
        )
        .catch((error: any) => {
          console.log(error);
          enqueueSnackbar(<Typography color="inherit">Failed to save changes - {error.message}!</Typography>, {
            variant: 'error',
            autoHideDuration: 1000,
          });
        });
    },
    [checklistItem, booking],
  );

  const handleCheckboxChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setChecklistItemChecked(event.target.checked);
      saveChecklistChanges('checked', event.target.checked);
    },
    [saveChecklistChanges],
  );

  const saveItemValue = useCallback(
    (isPrivate: boolean, itemValues: ChecklistItemValueDocument[]) => {
      saveChecklistChanges(isPrivate ? 'valuesAdmin' : 'values', itemValues);
    },
    [checklistItem, saveChecklistChanges, checklistItemValues, checklistItemValuesAdmin],
  );

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
    [storageBasePath],
  );

  const deleteFile = useCallback(
    async (item: ChecklistItemValueDocument): Promise<any> => {
      setRemovalInProgress(true);
      return new Promise((resolve, reject) => {
        try {
          const path = [storageBasePath, `${item.storedName}`].join('/');
          const storageRef = firebase.storage().ref();
          const documentRef = storageRef.child(encodeURI(path));

          documentRef
            .delete()
            .then(() => {
              const newItemArray = checklistItemValues.filter(chkItem => chkItem !== item);
              console.log('new Item array', JSON.stringify(newItemArray, null, 2));
              setCheckListItemValues(newItemArray);
              saveItemValue(false, newItemArray);
              resolve(item);
              setRemovalInProgress(false);
            })
            .catch(error => {
              reject(error);
              setRemovalInProgress(false);
              enqueueSnackbar(<Typography color="inherit">Failed to remove item - {error.message}!</Typography>, {
                variant: 'error',
                autoHideDuration: 1000,
              });
            });
        } catch (error) {
          enqueueSnackbar(<Typography color="inherit">Failed to remove item - {error.message}!</Typography>, {
            variant: 'error',
            autoHideDuration: 1000,
          });
        }
      });
    },
    [storageBasePath, checklistItemValues, removalInProgress],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      saveFiles(acceptedFiles)
        .then((documents: CheckListDocument[]) => {
          const values = documents.map(item => {
            const userActivityLogData = {
              firstName: userRecord?.firstName,
              lastName: userRecord?.lastName,
              alphacomClientId: userRecord?.alphacomClientId,
              alphacomId: userRecord?.alphacomId,
              emailAddress: userRecord?.emailAddress,
            } as ActivityLogUserData;
            return {
              uploadedBy: userActivityLogData,
              uploadedAt: new Date(),
              name: item.name,
              url: item.url,
              storedName: item.storedName,
            } as ChecklistItemValueDocument;
          });
          // FIXME it needs to be updated only after successful DB store
          const itemValues = checklistItemValues.concat(values);
          setCheckListItemValues(itemValues);
          saveItemValue(false, itemValues);
        })
        .catch(err => {
          console.error(`Error while storing files ${JSON.stringify(checklistItem, null, 2)}`, err);
        });
    },
    [checklistItemValues, saveFiles, saveChecklistChanges],
  );

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({ onDrop, noClick: true });

  return (
    <Box
      {...getRootProps()}
      className={isDragActive ? classes.dropZone : classes.root}
      display="flex"
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

      <Box display="flex" flexDirection="row">
        <Box flexDirection="row" alignContent="center">
          <Checkbox
            checked={checklistItemChecked}
            disabled={!isAdmin}
            onChange={event => handleCheckboxChange(event)}
          />
          <Typography display="inline">{checklistItem.label}</Typography>
          {checklistItem.label === 'VGM SUBMISSION' && (
            <Button
              variant="outlined"
              size="small"
              style={{ fontSize: '0.6rem', marginLeft: '8px' }}
              onClick={handleCompleted}
              disabled={!!checklistItem.confirmedByCustomer?.at}
            >
              {checklistItem.confirmedByCustomer?.at ? 'Done' : 'Mark Completed'}
            </Button>
          )}
        </Box>
        <Box flex="1" />
        <Box display="flex">
          <IconButton size="small" aria-label="Add Comment" onClick={handleMention}>
            <AddCommentIcon />
          </IconButton>
          <IconButton size="small" aria-label="Add Files" onClick={open}>
            <AttachFileIcon />
          </IconButton>
        </Box>
      </Box>
      {checklistItem.label === 'VGM SUBMISSION' && (
        <Typography>
          Please fill <Link href={getFormLink()}>this</Link> form, and mark completed when done
        </Typography>
      )}
      {/*Customer Data*/}
      <List className={classes.documentlist}>
        {(orderBy('uploadedAt', 'desc')(checklistItemValues) as ChecklistItemValueDocument[]).map((item, index) => (
          <ListItem key={`filelistitem-${booking?.id}-${index}`}>
            <a
              href={item.url}
              download={item.name}
              target="_blank"
              rel="noopener noreferrer"
              className={classes.fileItemLink}
            >
              <ListItemAvatar>
                <Avatar>
                  <DescriptionIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                id={`filelistitem-${booking?.id}-${index}`}
                primary={item.name}
                secondary={`${formatDistanceToNow(item.uploadedAt)} by ${item.uploadedBy.firstName}`}
              />
            </a>
            <ListItemSecondaryAction>
              <div className={classes.progressWrapper}>
                <IconButton size="small" aria-label="Add Comment" onClick={handleMention}>
                  <AddCommentIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  size="small"
                  aria-label="Remove File"
                  onClick={() => deleteFile(item)}
                  aria-labelledby={`filelistitem-${booking?.id}-${index}`}
                >
                  <DeleteIcon />
                </IconButton>
                {removalInProgress && <CircularProgress size={42} className={classes.iconDeleteProgress} />}
              </div>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

interface ChecklistItemRowProp {
  checklistItem: ChecklistItem;
  isAdmin: boolean | undefined;
  booking: Booking | undefined;
  setMentionedChecklist?: any;
}

interface ConfirmedByCustomer {
  by: ActivityLogUserData;
  at: Date;
}
export default ChecklistItemRow;
