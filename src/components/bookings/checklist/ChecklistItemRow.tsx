import React, { Fragment, useCallback, useContext, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  createStyles,
  Divider,
  IconButton,
  LinearProgress,
  Link,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import AddCommentIcon from '@material-ui/icons/AddComment';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import {
  ActivityChangeType,
  ActivityLogUserData,
  ChecklistItem,
  ChecklistItemValueDocument,
  ChecklistItemValueDocumentStatusType,
  CustomerAction,
  ShortChecklistItem,
  Stage,
} from './ChecklistItemModel';
import CloseIcon from '@material-ui/icons/Close';
import DoneIcon from '@material-ui/icons/Done';
import { flow, isNil, omitBy, omit } from 'lodash/fp';
import { useSnackbar } from 'notistack';
import useClients from '../../../hooks/useClients';
import { Booking, CarrierId, CheckListDocument } from '../../../model/Booking';
import firebase from '../../../firebase';
import { useDropzone } from 'react-dropzone';
import UserRecordContext from '../../../contexts/UserRecord';
import { ActivityLogItem, ActivityType } from './ActivityModel';
import ChecklistStagesView from './ChecklistStagesView';
import { useActivityLogState } from './ActivityLogContext';
import { addActivityItem } from './ActivityLogContainer';
import DocumentList from './DocumentList';
import ChecklistUserAction from './ChecklistUserAction';
import { editRestriction } from './CheckList';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      '&:focus': {
        outline: 'none',
      },
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
    tinyIconButton: {
      '& svg': {
        fontSize: 10,
      },
    },
    draftRoot: {
      maxWidth: '150px',
      border: '1px dashed #ccc',
      cursor: 'pointer',
      borderColor: '#999',
      '&:focus': {
        outline: 'none',
      },
    },
    draftDragZone: {
      border: '1px solid #ccc',
      cursor: 'pointer',
      borderColor: '#999',
      '&:focus': {
        outline: 'none',
      },
    },
    draftEmpty: {
      border: 'none',
    },
  }),
);

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

const checkStageDependency = (stages: Stage[], stageId: string) => {
  let index = stages.findIndex(el => el.id === stageId);
  console.log('INDEX', stages[index - 1].checked);
  if (index === -1) return false;
  if (index === 0) {
    return true;
  } else return stages[index - 1].checked;
};

const createActivityObject = (
  changeType: ActivityChangeType,
  by: ActivityLogUserData,
  checklistItem: ChecklistItem,
  documents?: ChecklistItemValueDocument[],
  stage?: Stage,
  internal?: boolean,
): ActivityLogItem =>
  flow(omitBy(isNil))({
    changeType: changeType,
    by: by,
    at: new Date(),
    type: ActivityType.ACTIVITY,
    isInternal: internal,
    checklistItem: {
      id: checklistItem.id,
      label: checklistItem.label,
      checked: !!checklistItem.checked,
    } as ShortChecklistItem,
    documents: documents,
    stage: stage,
  } as ActivityLogItem);

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

  const activityLogContext = useActivityLogState();

  const storeActivity = (checklistItemActivityHandler: () => Promise<void>) => {
    checklistItemActivityHandler()
      .then(_ => {
        enqueueSnackbar(<Typography color="inherit">Saved changes!</Typography>, {
          variant: 'success',
          autoHideDuration: 1000,
        });
      })
      .catch(error => {
        console.trace(error);
        enqueueSnackbar(<Typography color="inherit"> {error.message}!</Typography>, {
          variant: 'error',
          autoHideDuration: 3000,
        });
      });
  };

  const saveChecklistChanges = useCallback(
    (
      field: string,
      value: ChecklistItemValueDocument[] | undefined | boolean | ConfirmedByCustomer | Stage[] | CustomerAction,
    ) => {
      return firebase
        .firestore()
        .collection('bookings')
        .doc(booking?.id)
        .collection('checklist')
        .doc(checklistItem?.id)
        .update(field, value);
    },
    [booking?.id, checklistItem.id],
  );

  const checklistItemCheckedHandler = useCallback((checked: boolean) => {
    return saveChecklistChanges('checked', checked).then(_ =>
      addActivityItem(
        booking!.id,
        checklistItem!.id,
        createActivityObject(ActivityChangeType.CHECKED, getActivityLogUserData(), checklistItem),
      ),
    );
  }, []);

  const checklistItemMarkCompletedHandler = useCallback((action: CustomerAction) => {
    return saveChecklistChanges('customerAction', action).then(_ =>
      addActivityItem(
        booking!.id,
        checklistItem!.id,
        createActivityObject(ActivityChangeType.DONE_BY_CUSTOMER, getActivityLogUserData(), checklistItem),
      ),
    );
  }, []);

  const checklistItemFileDeletedHandler = useCallback(
    (documents: ChecklistItemValueDocument[], deletedFile: ChecklistItemValueDocument, internal: boolean) => {
      return saveChecklistChanges(internal ? 'valuesAdmin' : 'values', documents).then(_ =>
        addActivityItem(
          booking!.id,
          checklistItem!.id,
          createActivityObject(
            ActivityChangeType.DELETE_FILE,
            getActivityLogUserData(),
            checklistItem,
            [deletedFile],
            undefined,
            internal,
          ),
        ),
      );
    },
    [],
  );

  const checklistItemFileAddedHandler = useCallback(
    (documents: ChecklistItemValueDocument[], addedFiles: ChecklistItemValueDocument[], internal: boolean) => {
      return saveChecklistChanges(internal ? 'valuesAdmin' : 'values', documents).then(_ =>
        addActivityItem(
          booking!.id,
          checklistItem!.id,
          createActivityObject(
            ActivityChangeType.ADD_FILE,
            getActivityLogUserData(),
            checklistItem,
            addedFiles,
            undefined,
            internal,
          ),
        ),
      );
    },
    [],
  );

  const checklistItemStageChangeHandler = useCallback((stages: Stage[], stage: Stage) => {
    console.log(stage, 'STAGE');
    return saveChecklistChanges('stages', stages).then(_ =>
      addActivityItem(
        booking!.id,
        checklistItem!.id,
        createActivityObject(
          ActivityChangeType.STAGE_CHECKED,
          getActivityLogUserData(),
          checklistItem,
          undefined,
          stage,
        ),
      ),
    );
  }, []);

  const checklistItemDocumentStatusChangeHandler = useCallback(
    (documents: ChecklistItemValueDocument[], document: ChecklistItemValueDocument, internal: boolean) => {
      return saveChecklistChanges(internal ? 'valuesAdmin' : 'values', documents).then(_ =>
        addActivityItem(
          booking!.id,
          checklistItem!.id,
          createActivityObject(ActivityChangeType.DOCUMENT_STATUS_CHANGED, getActivityLogUserData(), checklistItem, [
            document,
          ]),
        ),
      );
    },
    [],
  );
  const handleMention = () => {
    activityLogContext.setState({ checklistReference: checklistItem });
  };

  const handleStageChange = (stage: Stage, checked: boolean) => {
    const newStage = { ...stage, checked: checked, by: getActivityLogUserData(), at: new Date() };
    const newItemArray = [...checklistItem.stages];
    newItemArray[newItemArray.findIndex(el => el.id === stage.id)] = newStage;
    storeActivity(() => checklistItemStageChangeHandler(newItemArray, newStage));
  };

  const handleCompleted = () => {
    const action = { ...checklistItem!.customerAction, by: getActivityLogUserData(), at: new Date() } as CustomerAction;
    storeActivity(() => checklistItemMarkCompletedHandler(action));
  };

  const handleUncompleted = () => {
    const action = omit(['by', 'at'])(checklistItem.customerAction) as CustomerAction;
    console.log('ACtion', action);
    storeActivity(() => checklistItemMarkCompletedHandler(action));
  };

  const handleCheckboxChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setChecklistItemChecked(event.target.checked);
      storeActivity(() => checklistItemCheckedHandler(event.target.checked));
    },
    [checklistItemCheckedHandler],
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

  const handleDocumentStatusChange = (item: ChecklistItemValueDocument, internal: boolean) => {
    let newItemArray: ChecklistItemValueDocument[];
    if (!editRestriction(item.status!.at as Date)) {
      return enqueueSnackbar(
        <Typography color="inherit">
          Failed to edit item - You cant change status after 30sec from last change!
        </Typography>,
        {
          variant: 'error',
          autoHideDuration: 1000,
        },
      );
    }
    if (internal) {
      const newDocument = { ...item };
      newItemArray = [...(checklistItem.valuesAdmin || [])];
      newItemArray[newItemArray.findIndex(el => el.url === item.url)] = newDocument;
      setCheckListItemValuesAdmin(newItemArray);
      if (isAdmin && newDocument.status?.type === ChecklistItemValueDocumentStatusType.APPROVED) {
        const newValues = checklistItemValues.filter(doc => doc.url !== item.url);
        newValues.push({
          ...newDocument,
          status: { type: ChecklistItemValueDocumentStatusType.DEFAULT },
        });
        saveChecklistChanges('values', newValues)
          .then(_ => console.log('Approved file'))
          .catch(err => console.log(err));
        setCheckListItemValues(newValues);
      } else if (isAdmin && newDocument.status?.type === ChecklistItemValueDocumentStatusType.REJECTED) {
        const newValues = checklistItemValues.filter(doc => doc.url !== item.url);
        saveChecklistChanges('values', newValues)
          .then(_ => console.log('Delete rejected file'))
          .catch(err => console.log(err));
        setCheckListItemValues(newValues);
      }
    } else {
      newItemArray = [...(checklistItem.values || [])];
      newItemArray[newItemArray.findIndex(el => el.url === item.url)] = { ...item };
      setCheckListItemValues(newItemArray);
      console.log(newItemArray, 'NEW ITEM ARRAY');
    }
    storeActivity(() => checklistItemDocumentStatusChangeHandler(newItemArray, item, internal));
  };

  const deleteFile = useCallback(
    async (item: ChecklistItemValueDocument, internal: boolean): Promise<any> => {
      setRemovalInProgress(true);
      return new Promise((resolve, reject) => {
        try {
          if (!editRestriction(item.status!.at as Date)) {
            return enqueueSnackbar(
              <Typography color="inherit">
                Failed to edit item - You cant change status after 30sec from last change!
              </Typography>,
              {
                variant: 'error',
                autoHideDuration: 1000,
              },
            );
          }
          const path = [storageBasePath, `${item.storedName}`].join('/');
          const storageRef = firebase.storage().ref();
          const documentRef = storageRef.child(encodeURI(path));

          documentRef
            .delete()
            .then(() => {
              let newItemArray: ChecklistItemValueDocument[];
              if (internal) {
                newItemArray = checklistItemValuesAdmin.filter(chkItem => chkItem !== item);
                setCheckListItemValuesAdmin(newItemArray);
              } else {
                newItemArray = checklistItemValues.filter(chkItem => chkItem !== item);
                setCheckListItemValues(newItemArray);
              }
              resolve(item);
              storeActivity(() => checklistItemFileDeletedHandler(newItemArray, item, internal));
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
    [storageBasePath, checklistItemValues, removalInProgress, checklistItemValuesAdmin],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[], internal: boolean) => {
      saveFiles(acceptedFiles)
        .then((documents: CheckListDocument[]) => {
          const values = documents.map(item => {
            return {
              uploadedBy: getActivityLogUserData(),
              uploadedAt: new Date(),
              name: item.name,
              url: item.url,
              storedName: item.storedName,
            } as ChecklistItemValueDocument;
          });
          // FIXME it needs to be updated only after successful DB store
          let itemValues: ChecklistItemValueDocument[] = [];
          if (internal) {
            itemValues = checklistItemValuesAdmin.concat(values);
            console.log('FILES', itemValues);
            setCheckListItemValuesAdmin(itemValues);
          } else {
            itemValues = checklistItemValues.concat(values);
            setCheckListItemValues(itemValues);
          }
          storeActivity(() => checklistItemFileAddedHandler(itemValues, values, internal));
          // saveItemValue(false, itemValues);
        })
        .catch(err => {
          console.error(`Error while storing files ${JSON.stringify(checklistItem, null, 2)}`, err);
        });
    },
    [checklistItemValues, saveFiles, storeActivity, saveChecklistChanges, checklistItemValuesAdmin],
  );

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => onDrop(acceptedFiles, false),
    noClick: true,
  });
  const {
    getRootProps: getRootPropsDraft,
    getInputProps: getInputPropsDraft,
    open: openDraft,
    isDragActive: isDragActiveDraft,
  } = useDropzone({ onDrop: (acceptedFiles: File[]) => onDrop(acceptedFiles, true) });

  return (
    <Box display="flex" justifyContent="space-between" my={1}>
      <Box
        {...getRootProps()}
        className={isDragActive ? classes.dropZone : classes.root}
        display="flex"
        flexDirection="column"
        id={checklistItem.id}
        flex={1}
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
            <a id={checklistItem.id}></a>
            {isAdmin ? (
              <Checkbox
                checked={checklistItemChecked}
                disabled={!isAdmin}
                onChange={event => handleCheckboxChange(event)}
              />
            ) : (
              checklistItemChecked && <DoneIcon />
            )}

            <Typography display="inline">{checklistItem.label}</Typography>
            {!isAdmin &&
              checklistItem.customerAction &&
              (checklistItem.customerAction.stageId
                ? checkStageDependency(checklistItem.stages, checklistItem.customerAction.stageId || '')
                : true) && (
                <Button
                  variant="outlined"
                  size="small"
                  style={{ fontSize: '0.6rem', marginLeft: '8px' }}
                  onClick={checklistItem.customerAction?.at ? handleUncompleted : handleCompleted}
                >
                  {checklistItem.customerAction?.at ? 'Undo Mark Completed' : 'Mark Completed'}
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
        {!isAdmin &&
          checklistItem.customerAction &&
          !checklistItem.customerAction?.at &&
          (checklistItem.customerAction.stageId
            ? checkStageDependency(checklistItem.stages, checklistItem.customerAction.stageId || '')
            : true) && <ChecklistUserAction booking={booking} checklistItem={checklistItem} />}

        {isAdmin && checklistItem.stages && (
          <ChecklistStagesView stages={checklistItem.stages} handleChange={handleStageChange} />
        )}
        {/*Customer Data*/}
        <DocumentList
          checklistItemValues={checklistItemValues}
          bookingId={booking!.id}
          removalInProgress={removalInProgress}
          deleteFile={(item: ChecklistItemValueDocument) => deleteFile(item, false)}
          checklistItem={checklistItem}
          changeStatus={(item: ChecklistItemValueDocument) => handleDocumentStatusChange(item, false)}
          internal={false}
        />
        {isAdmin && checklistItemValuesAdmin.length > 0 && (
          <Fragment>
            <Divider />
            <Typography variant="caption">Drafts</Typography>
            <DocumentList
              checklistItemValues={checklistItemValuesAdmin}
              bookingId={booking!.id}
              removalInProgress={removalInProgress}
              deleteFile={(item: ChecklistItemValueDocument) => deleteFile(item, true)}
              checklistItem={checklistItem}
              changeStatus={(item: ChecklistItemValueDocument) => handleDocumentStatusChange(item, true)}
              internal={true}
            />
          </Fragment>
        )}
      </Box>
      {isAdmin && (
        <Fragment>
          <Divider orientation="vertical" flexItem={true} />
          <Box
            {...getRootPropsDraft()}
            className={
              isDragActiveDraft ? classes.draftDragZone : isDragActive ? classes.draftEmpty : classes.draftRoot
            }
            flexBasis="fit-content"
            display="flex"
            flexDirection="column"
            id={checklistItem.id}
            justifyContent="center"
            alignItems="center"
            px={1}
          >
            <input {...getInputPropsDraft()} />
            Drafts
          </Box>
        </Fragment>
      )}
    </Box>
  );
};

interface ChecklistItemRowProp {
  checklistItem: ChecklistItem;
  isAdmin: boolean | undefined;
  booking: Booking;
  setMentionedChecklist?: any;
}

interface ConfirmedByCustomer {
  by: ActivityLogUserData;
  at: Date;
}

export default ChecklistItemRow;
