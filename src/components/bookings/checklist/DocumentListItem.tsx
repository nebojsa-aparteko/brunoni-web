import React, { useCallback, useContext, useState } from 'react';
import {
  Avatar,
  Box,
  CircularProgress,
  createStyles,
  IconButton,
  Link,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import DescriptionIcon from '@material-ui/icons/Description';
import AddCommentIcon from '@material-ui/icons/AddComment';
import DeleteIcon from '@material-ui/icons/Delete';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import CheckCircleOutlineOutlinedIcon from '@material-ui/icons/CheckCircleOutlineOutlined';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import {
  ActivityChangeType,
  ActivityLogUserData,
  ChecklistItem,
  ChecklistItemValueDocument,
  ChecklistItemValueDocumentStatus,
  ChecklistItemValueDocumentStatusType,
} from './ChecklistItemModel';
import { green } from '@material-ui/core/colors';
import { useActivityLogState } from './ActivityLogContext';
import ActingAs from '../../../contexts/ActingAs';
import { editRestriction } from './CheckList';
import UserRecordContext from '../../../contexts/UserRecordContext';
import { invoke } from 'lodash/fp';
import firebase from '../../../firebase';
import { useSnackbar } from 'notistack';
import { addActivityItem } from './ActivityLogContainer';
import { createActivityObject } from './ChecklistItemRow';
import { formatDistanceToNowConfigured } from '../../../utilities/formattingHelpers';
import theme from '../../../theme';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
    approved: {
      backgroundColor: 'rgba(0,200,81, 0.7)',
    },
    reject: {
      backgroundColor: 'rgba(255,68,68, 0.7)',
    },
  }),
);

const findClassName = (item: ChecklistItemValueDocumentStatus | undefined, classes: any) => {
  if (!item) {
    return '';
  }
  if (item.type === ChecklistItemValueDocumentStatusType.DEFAULT) return '';
  if (item.type === ChecklistItemValueDocumentStatusType.APPROVED) return classes.approved;
  if (item.type === ChecklistItemValueDocumentStatusType.REJECTED) return classes.reject;
};

const findTextForStatusType = (type: ChecklistItemValueDocumentStatusType) => {
  switch (type) {
    case ChecklistItemValueDocumentStatusType.APPROVED:
      return 'Approved';
    case ChecklistItemValueDocumentStatusType.DEFAULT:
      return '';
    case ChecklistItemValueDocumentStatusType.REJECTED:
      return 'Revision needed';
  }
};

const DocumentListItem = ({
  item,
  checklistItem,
  bookingId,
  changeStatus,
  storageBasePath,
  internal,
  ...other
}: DocumentListItemProps) => {
  const classes = useStyles();
  const activityLogContext = useActivityLogState();
  const userRecord = useContext(UserRecordContext);
  const [actingAs] = useContext(ActingAs);
  const isAdmin = !actingAs;

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

  const checklistItemFileDeletedHandler = useCallback(
    (documents: ChecklistItemValueDocument[], deletedFile: ChecklistItemValueDocument, internal: boolean) => {
      firebase
        .firestore()
        .collection('bookings')
        .doc(bookingId)
        .collection('checklist')
        .doc(checklistItem?.id)
        .update(internal ? 'valuesAdmin' : 'values', documents)
        .then(_ => {
          console.log('File deleted', deletedFile, documents, internal, checklistItem);
          return addActivityItem(
            bookingId,
            checklistItem!.id,
            createActivityObject(
              ActivityChangeType.DELETE_FILE,
              getActivityLogUserData(),
              checklistItem,
              [deletedFile],
              undefined,
              internal,
            ),
          );
        })
        .catch(error => {
          console.error('failed to update deleted items', error);
          enqueueSnackbar(<Typography color="inherit">Failed to delete item - {error.message}</Typography>, {
            variant: 'error',
            autoHideDuration: 1000,
          });
        });
    },
    [bookingId, checklistItem, enqueueSnackbar, getActivityLogUserData],
  );

  const [removalInProgress, setRemovalInProgress] = useState(false); //used when file is being removed from the list

  const handleMention = () =>
    activityLogContext.setState({ documentReference: item, checklistReference: checklistItem, internal: internal });
  const checklistCheckedRule = () => checklistItem.checked;

  const deleteFile = useCallback(
    (item: ChecklistItemValueDocument, internal: boolean) => {
      setRemovalInProgress(true);
      try {
        if (!editRestriction(item.uploadedAt as Date)) {
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
        if (!internal && checklistItem.valuesAdmin?.findIndex(f => f.storedName === item.storedName) !== -1) {
          const newItemArray = checklistItem.values?.filter(chkItem => chkItem !== item);
          checklistItemFileDeletedHandler(newItemArray || [], item, internal);
        } else {
          documentRef
            .delete()
            .then(() => {
              console.debug('file deleted from storage ', item);
            })
            .catch(error => {
              console.error('Failed to remove item - {error.message}', error);
            })
            .finally(() => {
              // remove item from the list in any case since if it is an error with the storage means file is alrady out
              setRemovalInProgress(false);
              const newItemArray = internal
                ? checklistItem.valuesAdmin?.filter(chkItem => chkItem !== item)
                : checklistItem.values?.filter(chkItem => chkItem !== item);
              checklistItemFileDeletedHandler(newItemArray || [], item, internal);
            });
        }
      } catch (error) {
        setRemovalInProgress(false);
        enqueueSnackbar(<Typography color="inherit">Failed to remove item - {error.message}!</Typography>, {
          variant: 'error',
          autoHideDuration: 1000,
        });
      }
    },
    [storageBasePath, checklistItem, removalInProgress],
  );

  return (
    <div {...other}>
      <ListItem>
        <a
          href={item.url}
          download={item.name}
          target="_blank"
          rel="noopener noreferrer"
          className={classes.fileItemLink}
        >
          <ListItemAvatar>
            <Avatar color="primary" className={findClassName(item.status, classes)}>
              <DescriptionIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            id={`filelistitem-${item.storedName}`}
            disableTypography
            primary={
              <Typography style={{ wordBreak: 'break-word', paddingRight: theme.spacing(5) }}>{item.name}</Typography>
            }
            secondary={
              <span>
                <Typography variant="caption">
                  {`${formatDistanceToNowConfigured(item.uploadedAt)} by ${item.uploadedBy.firstName}`}
                </Typography>
                <br />
                {item.status?.at && (
                  <Typography variant="caption">
                    {`${findTextForStatusType(item.status?.type)} ${formatDistanceToNowConfigured(
                      invoke('toDate')(item.status.at),
                    )} by ${item.status?.by?.firstName}`}
                  </Typography>
                )}
              </span>
            }
          />
        </a>
        <ListItemSecondaryAction>
          <div className={classes.progressWrapper}>
            <IconButton size="small" aria-label="Add Comment" onClick={handleMention}>
              <AddCommentIcon />
            </IconButton>
            {item.status?.type !== ChecklistItemValueDocumentStatusType.APPROVED &&
              editRestriction(item.uploadedAt) &&
              !checklistCheckedRule() && (
                <IconButton
                  edge="end"
                  size="small"
                  aria-label="Remove File"
                  onClick={event => {
                    event.stopPropagation();
                    deleteFile(item, internal);
                  }}
                  aria-labelledby={`filelistitem-${item.storedName}`}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            {removalInProgress && <CircularProgress size={42} className={classes.iconDeleteProgress} />}
          </div>
        </ListItemSecondaryAction>
      </ListItem>
      {((internal && isAdmin) || (!internal && !isAdmin)) &&
        (item.status?.at ? editRestriction(item.status.at) : true) &&
        (!internal && !isAdmin ? userRecord?.emailAddress !== item.uploadedBy.emailAddress : true) &&
        !checklistCheckedRule() && (
          <Box display="flex" ml={2} flexBasis="fit-content">
            {item.status !== undefined && item.status?.type !== ChecklistItemValueDocumentStatusType.DEFAULT && (
              <Box display="flex" ml={2} mb={2}>
                <AccessTimeIcon style={{ color: '#5f91c5' }} />
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => {
                    changeStatus(item, {
                      type: ChecklistItemValueDocumentStatusType.DEFAULT,
                      by: getActivityLogUserData(),
                    });
                    activityLogContext.setState(undefined);
                  }}
                >
                  Undo
                </Link>
              </Box>
            )}
            {item.status?.type !== ChecklistItemValueDocumentStatusType.APPROVED && (
              <Box display="flex" ml={2} mb={2}>
                <CheckCircleOutlineOutlinedIcon style={{ color: '#5f91c5' }} />
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => {
                    changeStatus(item, {
                      type: ChecklistItemValueDocumentStatusType.APPROVED,
                      by: getActivityLogUserData(),
                      at: new Date(),
                    });
                    activityLogContext.setState(undefined);
                  }}
                >
                  Approve
                </Link>
              </Box>
            )}
            {item.status?.type !== ChecklistItemValueDocumentStatusType.REJECTED && (
              <Box display="flex" ml={2} mb={2}>
                <CancelOutlinedIcon style={{ color: '#5f91c5' }} />
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => {
                    changeStatus(item, {
                      type: ChecklistItemValueDocumentStatusType.REJECTED,
                      by: getActivityLogUserData(),
                      at: new Date(),
                    });
                    activityLogContext.setState({
                      rejected: true,
                      documentReference: item,
                      checklistReference: checklistItem,
                    });
                  }}
                >
                  Reject
                </Link>
              </Box>
            )}
          </Box>
        )}
    </div>
  );
};

export default DocumentListItem;

export interface DocumentListItemPropsBase {
  checklistItem: ChecklistItem;
  bookingId: string;
  storageBasePath: string;
  changeStatus: (item: ChecklistItemValueDocument, status: ChecklistItemValueDocumentStatus) => void;
  internal: boolean;
}

interface DocumentListItemProps extends DocumentListItemPropsBase {
  item: ChecklistItemValueDocument;
}
