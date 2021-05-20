import React, { Fragment, useCallback, useContext, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  createStyles,
  Divider,
  IconButton,
  LinearProgress,
  makeStyles,
  Theme,
  Tooltip,
  Typography,
} from '@material-ui/core';
import EmailIcon from '@material-ui/icons/Email';
import AddCommentIcon from '@material-ui/icons/AddComment';
import AttachFileIcon from '@material-ui/icons/AttachFile';
import {
  ActivityChangeType,
  ActivityLogUserData,
  ChecklistItem,
  ChecklistItemValueDocument,
  ChecklistItemValueDocumentStatusType,
  CustomerAction,
  CustomerChecklistActionType,
  DocumentValueStatus,
  ShortChecklistItem,
  Stage,
} from './ChecklistItemModel';
import CloseIcon from '@material-ui/icons/Close';
import DoneIcon from '@material-ui/icons/Done';
import { flow, isNil, omit, omitBy } from 'lodash/fp';
import { useSnackbar } from 'notistack';
import { Booking, StoredDocument } from '../../../model/Booking';
import firebase from '../../../firebase';
import { useDropzone } from 'react-dropzone';
import UserRecordContext from '../../../contexts/UserRecordContext';
import { ActivityLogItem, ActivityType, PaymentActivityData } from './ActivityModel';
import ChecklistStagesView from './ChecklistStagesView';
import { useActivityLogState } from './ActivityLogContext';
import { addActivityItem } from './ActivityLogContainer';
import DocumentList from './DocumentList';
import ChecklistUserAction from './ChecklistUserAction';
import { editRestriction } from './CheckList';
import ActionModal from './ActionModel';
import DropZone, { makeContentDispositionFileName } from '../../DropZone';
import { MentionItem } from 'react-mentions';
import SendEmailDialog from './SendEmailDialog';

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

export const fileWithExt = (fileName: string): { name: string; ext: string } => {
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
  if (index === -1) return false;
  if (index === 0) {
    return true;
  } else return stages[index - 1].checked;
};

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

const ChecklistItemRow = ({ booking, checklistItem, isAdmin, comparableDocuments }: ChecklistItemRowProp) => {
  const classes = useStyles();
  const userRecord = useContext(UserRecordContext);
  const { enqueueSnackbar } = useSnackbar();

  const storageBasePath = useMemo((): string => {
    return ['booking-documents', 'clients', booking.ForwAdrId, 'bookings', booking.id, checklistItem.id].join('/');
  }, [booking, checklistItem]);

  const [isActionDialogOpen, setActionDialogOpen] = useState(false);
  // status indicators
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTask, setUploadTask] = useState<firebase.storage.UploadTask>(); // add some control to uploads so that users can cancel
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

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
        .collection('bookings')
        .doc(booking?.id)
        .collection('checklist')
        .doc(checklistItem?.id)
        .update(field, value);
    },
    [booking, checklistItem],
  );

  const checklistItemCheckedHandler = useCallback(
    (checked: boolean) => {
      return saveChecklistChanges('checked', checked).then(_ =>
        addActivityItem(
          booking!.id,
          createActivityObject({
            changeType: ActivityChangeType.CHECKED,
            by: getActivityLogUserData(),
            checklistItem: { ...checklistItem, checked },
          }),
        ),
      );
    },
    [booking, checklistItem, getActivityLogUserData, saveChecklistChanges],
  );

  const checklistItemMarkCompletedHandler = useCallback(
    (action: CustomerAction, type?: ActivityChangeType) => {
      return saveChecklistChanges('customerAction', action).then(_ =>
        addActivityItem(
          booking!.id,
          createActivityObject({
            changeType: type ? ActivityChangeType.UNDO_COMPLETED_CUSTOMER : ActivityChangeType.DONE_BY_CUSTOMER,
            by: getActivityLogUserData(),
            checklistItem: checklistItem,
          }),
        ),
      );
    },
    [booking, checklistItem, getActivityLogUserData, saveChecklistChanges],
  );

  const checklistItemFileAddedHandler = useCallback(
    (addedFiles: ChecklistItemValueDocument[], internal: boolean) => {
      const newDocuments = ((internal ? checklistItem.valuesAdmin : checklistItem.values) || []).concat(addedFiles);
      return saveChecklistChanges(internal ? 'valuesAdmin' : 'values', newDocuments)
        .then(_ =>
          addActivityItem(
            booking!.id,
            createActivityObject({
              changeType: ActivityChangeType.ADD_FILE,
              by: getActivityLogUserData(),
              checklistItem: checklistItem,
              documents: addedFiles,
              internal: internal,
            }),
          ),
        )
        .catch(error => console.error('Error saving new document list', error));
    },
    [booking, checklistItem, getActivityLogUserData, saveChecklistChanges],
  );

  const checklistItemStageChangeHandler = useCallback(
    (stages: Stage[], stage: Stage) => {
      return saveChecklistChanges('stages', stages).then(_ =>
        addActivityItem(
          booking!.id,
          createActivityObject({
            changeType: ActivityChangeType.STAGE_CHECKED,
            by: getActivityLogUserData(),
            checklistItem: checklistItem,
            stage: stage,
          }),
        ),
      );
    },
    [booking, checklistItem, getActivityLogUserData, saveChecklistChanges],
  );

  const checklistItemDocumentStatusChangeHandler = useCallback(
    (
      documents: ChecklistItemValueDocument[],
      document: ChecklistItemValueDocument,
      internal: boolean,
      dontCreateActivity?: boolean,
    ) => {
      return saveChecklistChanges(internal ? 'valuesAdmin' : 'values', documents).then(_ => {
        if (!dontCreateActivity) {
          return addActivityItem(
            booking!.id,
            createActivityObject({
              changeType: ActivityChangeType.DOCUMENT_STATUS_CHANGED,
              by: getActivityLogUserData(),
              checklistItem: checklistItem,
              documents: [document],
            }),
          );
        }
      });
    },
    [booking, checklistItem, saveChecklistChanges, getActivityLogUserData],
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
    storeActivity(() => checklistItemMarkCompletedHandler(action, ActivityChangeType.UNDO_COMPLETED_CUSTOMER));
  };

  const handleCheckboxChange = useCallback(
    (value: boolean) => {
      storeActivity(() => checklistItemCheckedHandler(value));
    },
    [checklistItemCheckedHandler, storeActivity],
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
              storageRef.updateMetadata({
                contentDisposition: makeContentDispositionFileName(checklistItem, booking, file),
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
    [storageBasePath, booking, checklistItem, enqueueSnackbar],
  );

  const handleSelectForComparison = (item: ChecklistItemValueDocument) => {
    saveChecklistChanges(
      'values',
      checklistItem.values?.map(value =>
        value.url === item.url ? { ...value, isSelectedForComparison: !item.isSelectedForComparison } : value,
      ),
    ).then(() => {
      console.log('done');
      return addActivityItem(
        booking!.id,
        createActivityObject({
          changeType: !item.isSelectedForComparison
            ? ActivityChangeType.SELECT_FOR_COMPARISON
            : ActivityChangeType.UNSELECT_FOR_COMPARISON,
          by: getActivityLogUserData(),
          checklistItem: checklistItem,
          documents: [item],
        }),
      );
    });
  };

  const handleMarkAsFinal = (item: ChecklistItemValueDocument, internal: boolean) => {
    saveChecklistChanges(
      internal ? 'valuesAdmin' : 'values',
      (internal ? checklistItem.valuesAdmin : checklistItem.values)?.map(value =>
        value.url === item.url ? { ...value, final: !item.final } : value,
      ),
    ).then(() => {
      console.log('done');
      return addActivityItem(
        booking!.id,
        createActivityObject({
          changeType: !item.final ? ActivityChangeType.MARK_AS_FINAL : ActivityChangeType.UNMARK_AS_FINAL,
          by: getActivityLogUserData(),
          checklistItem: checklistItem,
          documents: [item],
        }),
      );
    });
  };

  const handleDocumentStatusChange = (
    item: ChecklistItemValueDocument,
    status: DocumentValueStatus,
    internal: boolean,
    dontCreateActivity?: boolean,
  ) => {
    console.log(dontCreateActivity);
    let newItemArray: ChecklistItemValueDocument[];
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
    if (internal) {
      const newDocument = { ...item, status: status };
      newItemArray = [...(checklistItem.valuesAdmin || [])];
      newItemArray[newItemArray.findIndex(el => el.url === item.url)] = newDocument;
      if (isAdmin && newDocument.status?.type === ChecklistItemValueDocumentStatusType.APPROVED) {
        const newValues = checklistItem.values?.filter(doc => doc.url !== item.url) || [];
        newValues.push({
          ...newDocument,
          status: { type: ChecklistItemValueDocumentStatusType.DEFAULT },
        });
        saveChecklistChanges('values', newValues)
          .then(_ => console.log('Approved file'))
          .catch(err => console.log(err));
      } else if (isAdmin && newDocument.status?.type === ChecklistItemValueDocumentStatusType.REJECTED) {
        const newValues = checklistItem.values?.filter(doc => doc.url !== item.url);
        saveChecklistChanges('values', newValues)
          .then(_ => console.log('Delete rejected file'))
          .catch(err => console.log(err));
      } else if (
        isAdmin &&
        newDocument.status?.type === ChecklistItemValueDocumentStatusType.DEFAULT &&
        item.status?.type === ChecklistItemValueDocumentStatusType.APPROVED
      ) {
        const newValues = checklistItem.values?.filter(doc => doc.url !== item.url);
        saveChecklistChanges('values', newValues)
          .then(_ => console.log('Delete rejected file'))
          .catch(err => console.log(err));
      }
    } else {
      newItemArray = [...(checklistItem.values || [])];
      newItemArray[newItemArray.findIndex(el => el.url === item.url)] = { ...item, status: status };
    }
    storeActivity(() =>
      checklistItemDocumentStatusChangeHandler(newItemArray, { ...item, status: status }, internal, dontCreateActivity),
    );
  };

  const onDrop = useCallback(
    (acceptedFiles: File[], internal: boolean) => {
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
          storeActivity(() => checklistItemFileAddedHandler(values, internal));
        })
        .catch(err => {
          console.error(`Error while storing files ${JSON.stringify(checklistItem, null, 2)}`, err);
        });
    },
    [checklistItem, saveFiles, storeActivity, checklistItemFileAddedHandler, getActivityLogUserData],
  );

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => onDrop(acceptedFiles, false),
    noClick: true,
  });

  const {
    getRootProps: getRootPropsDraftNoClick,
    getInputProps: getInputPropsDraftNoClick,
    open: openDraftNoClick,
    isDragActive: isDragActiveDraftNoClick,
  } = useDropzone({ onDrop: (acceptedFiles: File[]) => onDrop(acceptedFiles, true), noClick: true });

  return (
    <Box
      id={'checklistItemRow_' + checklistItem.id}
      display="flex"
      justifyContent="space-between"
      my={1}
      flexDirection={isAdmin && checklistItem.valuesAdmin?.length === 0 ? 'row' : 'column'}
    >
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
          <Box flexDirection="row" alignContent="center" id={checklistItem.id}>
            {isAdmin ? (
              <Checkbox
                checked={checklistItem.checked}
                disabled={!isAdmin}
                onChange={event =>
                  event.target.checked ? handleCheckboxChange(event.target.checked) : setActionDialogOpen(true)
                }
              />
            ) : (
              checklistItem.checked && <DoneIcon />
            )}

            <Typography display="inline">{checklistItem.label}</Typography>
            {!isAdmin &&
              !checklistItem.checked &&
              checklistItem.customerAction &&
              checklistItem.customerAction.action === CustomerChecklistActionType.fillForm &&
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
            <IconButton id="mentionIconChecklist" size="small" aria-label="Add Comment" onClick={handleMention}>
              <AddCommentIcon style={{ color: (checklistItem.mentionCount || 0) > 0 ? '#F7BC06' : 'inherit' }} />
            </IconButton>
            <IconButton size="small" aria-label="Add Files" onClick={open}>
              <AttachFileIcon />
            </IconButton>
            {checklistItem.id === 'FREIGHT COLLECTION' && (
              <Tooltip title="Send email" placement={'top'}>
                <IconButton size="small" aria-label="send email" onClick={() => setEmailDialogOpen(true)}>
                  <EmailIcon />
                </IconButton>
              </Tooltip>
            )}
            {emailDialogOpen && (
              <SendEmailDialog booking={booking} setDialogOpen={setEmailDialogOpen} dialogOpen={emailDialogOpen} />
            )}
          </Box>
        </Box>
        {!isAdmin &&
          !checklistItem.checked &&
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
          storageBasePath={storageBasePath}
          checklistItemValues={checklistItem.values || []}
          booking={booking}
          checklistItem={checklistItem}
          changeStatus={(item: ChecklistItemValueDocument, status: DocumentValueStatus, dontCreateActivity?: boolean) =>
            handleDocumentStatusChange(item, status, false, dontCreateActivity)
          }
          internal={false}
          markAsFinal={item => handleMarkAsFinal(item, false)}
          otherDocuments={comparableDocuments}
          selectForComparison={item => handleSelectForComparison(item)}
        />
      </Box>
      <Box>
        {isAdmin && checklistItem.valuesAdmin && checklistItem.valuesAdmin?.length > 0 && (
          <Box
            {...getRootPropsDraftNoClick()}
            className={isDragActiveDraftNoClick ? classes.dropZone : classes.root}
            flexBasis="fit-content"
            display="flex"
            flexDirection="column"
            flex={1}
            id={checklistItem.id}
            px={1}
          >
            <input {...getInputPropsDraftNoClick()} />
            <Divider />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="subtitle2">Internals</Typography>
              <IconButton size="small" aria-label="Add Draft Files" onClick={openDraftNoClick}>
                <AttachFileIcon />
              </IconButton>
            </Box>

            <DocumentList
              storageBasePath={storageBasePath}
              checklistItemValues={checklistItem.valuesAdmin || []}
              booking={booking}
              checklistItem={checklistItem}
              changeStatus={(
                item: ChecklistItemValueDocument,
                status: DocumentValueStatus,
                dontCreateActivity?: boolean,
              ) => handleDocumentStatusChange(item, status, true, dontCreateActivity)}
              internal={true}
              markAsFinal={item => handleMarkAsFinal(item, true)}
              otherDocuments={comparableDocuments}
              selectForComparison={item => handleSelectForComparison(item)}
            />
          </Box>
        )}
      </Box>
      {isAdmin && checklistItem.valuesAdmin?.length === 0 && (
        <Fragment>
          <Divider orientation="vertical" flexItem={true} />
          <DropZone
            label={'Internals'}
            storageBasePath={storageBasePath}
            booking={booking}
            checklistItem={checklistItem}
            internal={true}
            onUpload={(values, internal) => storeActivity(() => checklistItemFileAddedHandler(values, internal))}
          />
        </Fragment>
      )}
      {isActionDialogOpen && (
        <ActionModal
          isOpen={isActionDialogOpen}
          handleClose={() => setActionDialogOpen(false)}
          onSuccess={() => handleCheckboxChange(false)}
        >
          <Typography>
            Are you sure you want to uncheck an item? If you uncheck item, that can generate new notification to the
            customer?
          </Typography>
        </ActionModal>
      )}
    </Box>
  );
};

interface ChecklistItemRowProp {
  checklistItem: ChecklistItem;
  isAdmin: boolean | undefined;
  booking: Booking;
  comparableDocuments: ChecklistItemValueDocument[];
}

interface ConfirmedByCustomer {
  by: ActivityLogUserData;
  at: Date;
}

export default ChecklistItemRow;
