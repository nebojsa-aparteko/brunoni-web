import React, { useCallback, useContext, useMemo, useState, Fragment } from 'react';
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
  ShortChecklistItem,
  Stage,
} from './ChecklistItemModel';
import CloseIcon from '@material-ui/icons/Close';
import DoneIcon from '@material-ui/icons/Done';
import { flow, isNil, omitBy } from 'lodash/fp';
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

const getFormLink = (carrierId: any): string => {
  switch (carrierId) {
    case CarrierId.ALIANCA:
      return 'https://www.hamburgsud-line.com/liner/en/liner_services/ecommerce/verified_gross_mass_ecommerce/index.html';
    case CarrierId.HAMBURG_SUD:
      return 'https://www.hamburgsud-line.com/liner/de/liner_services/ecommerce/verified_gross_mass_ecommerce/index.html';
    case CarrierId.HYUNDAI_MERCHANT:
      return 'http://www.hmm21.com/cms/business/ebiz/export/vgmWithoutLogin/index.jsp';
    case CarrierId.MACS:
      return 'https://www.macship.com/E-BUSINESS/SolasAccess.aspx';
    case CarrierId.ZIM:
      return 'https://www.zim.com/tools/solas-vgm';
    case CarrierId.DEUTSCHE_AFRIKA:
      return 'https://my.dal.biz/vgm#/login';
    default:
      return '#';
  }
};

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

const createActivityObject = (
  changeType: ActivityChangeType,
  by: ActivityLogUserData,
  checklistItem: ChecklistItem,
  documents?: ChecklistItemValueDocument[],
  stage?: Stage,
): ActivityLogItem =>
  flow(omitBy(isNil))({
    changeType: changeType,
    by: by,
    at: new Date(),
    type: ActivityType.ACTIVITY,
    isInternal: false,
    checklistItem: {
      id: checklistItem.id,
      label: checklistItem.label,
      checked: checklistItem.checked,
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
  const linkForm = getFormLink(booking?.CarrierID);

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
      .then(_ =>
        enqueueSnackbar(<Typography color="inherit">Saved changes!</Typography>, {
          variant: 'success',
          autoHideDuration: 1000,
        }),
      )
      .catch(error => {
        console.trace(error);
        enqueueSnackbar(<Typography color="inherit"> {error.message}!</Typography>, {
          variant: 'error',
          autoHideDuration: 3000,
        });
      });
  };

  const saveChecklistChanges = useCallback(
    (field: string, value: ChecklistItemValueDocument[] | undefined | boolean | ConfirmedByCustomer | Stage[]) => {
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

  const checklistItemFileDeletedHandler = useCallback(
    (documents: ChecklistItemValueDocument[], deletedFile: ChecklistItemValueDocument) => {
      return saveChecklistChanges('values', documents).then(_ =>
        addActivityItem(
          booking!.id,
          checklistItem!.id,
          createActivityObject(ActivityChangeType.DELETE_FILE, getActivityLogUserData(), checklistItem, [deletedFile]),
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
          createActivityObject(ActivityChangeType.ADD_FILE, getActivityLogUserData(), checklistItem, addedFiles),
        ),
      );
    },
    [],
  );

  const checklistItemStageChangeHandler = useCallback((stages: Stage[], stage: Stage) => {
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
    saveChecklistChanges('confirmedByCustomer', {
      by: getActivityLogUserData(),
      at: new Date(),
    } as ConfirmedByCustomer);
  };

  const handleCheckboxChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setChecklistItemChecked(event.target.checked);
      storeActivity(() => checklistItemCheckedHandler(event.target.checked));
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
    async (item: ChecklistItemValueDocument, internal: boolean): Promise<any> => {
      setRemovalInProgress(true);
      return new Promise((resolve, reject) => {
        try {
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
              storeActivity(() => checklistItemFileDeletedHandler(newItemArray, item));

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
            {!isAdmin && checklistItem.label === 'VGM SUBMISSION' && (
              <Button
                variant="outlined"
                size="small"
                style={{ fontSize: '0.6rem', marginLeft: '8px' }}
                onClick={handleCompleted}
                disabled={!!(checklistItem.confirmedByCustomer && checklistItem.confirmedByCustomer?.at)}
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
        {!isAdmin ? (
          checklistItem.label === 'VGM SUBMISSION' && linkForm !== '#' ? (
            <Typography>
              Please fill{' '}
              <Link href={getFormLink(booking?.CarrierID)} target="_blank">
                this
              </Link>
              form, and mark completed when done
            </Typography>
          ) : (
            <Typography> Please upload documents here.</Typography>
          )
        ) : null}
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
