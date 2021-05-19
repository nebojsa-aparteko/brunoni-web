import React, { useCallback, useContext, useState } from 'react';
import {
  Avatar,
  CircularProgress,
  createStyles,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import DescriptionIcon from '@material-ui/icons/Description';
import { formatDistanceToNowConfigured } from '../../utilities/formattingHelpers';
import { isPlatformActivity } from '../../utilities/activityHelper';
import { invoke } from 'lodash/fp';
import AssignmentIcon from '@material-ui/icons/Assignment';
import CompareIcon from '@material-ui/icons/Compare';
import AddCommentIcon from '@material-ui/icons/AddComment';
import DeleteIcon from '@material-ui/icons/Delete';
import FlagIcon from '@material-ui/icons/Flag';
import { ActivityLogContextProps, useActivityLogState } from '../bookings/checklist/ActivityLogContext';
import useGlobalAppState from '../../hooks/useGlobalAppState';
import ActingAs from '../../contexts/ActingAs';
import useActivityLogUserData from '../../hooks/useActivityLogUserData';
import {
  ActivityChangeType,
  ChecklistItemValueDocument,
  ChecklistItemValueDocumentStatusType,
  DocumentValue,
  DocumentValueStatus,
} from '../bookings/checklist/ChecklistItemModel';
import { editRestriction } from '../bookings/checklist/CheckList';
import firebase from '../../firebase';
import { SAVED_ACTION_SNACKBAR } from '../../store/types/globalAppState';
import { ActivityCreationProps, createActivityObject, fileWithExt } from '../bookings/checklist/ChecklistItemRow';
import { green } from '@material-ui/core/colors';
import theme from '../../theme/index';
import { ActivityLogItem } from '../bookings/checklist/ActivityModel';

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
    final: {
      '&:hover': {
        color: '#F7BC06',
      },
    },
  }),
);

const findClassName = (item: DocumentValueStatus | undefined, classes: any) => {
  switch (item?.type) {
    case ChecklistItemValueDocumentStatusType.APPROVED:
      return classes.approved;
    case ChecklistItemValueDocumentStatusType.REJECTED:
      return classes.reject;
    default:
      return '';
  }
};

const findTextForStatusType = (type: ChecklistItemValueDocumentStatusType) => {
  switch (type) {
    case ChecklistItemValueDocumentStatusType.APPROVED:
      return 'Approved';
    case ChecklistItemValueDocumentStatusType.REJECTED:
      return 'Revision needed';
    default:
      return '';
  }
};

const addActivity = (path: string, activity: ActivityLogItem) =>
  firebase
    .firestore()
    .collection(path)
    .add(activity);

const BookingRequestDocumentListItem: React.FC<BookingRequestDocumentListItemProps> = ({
  item,
  storageBasePath,
  collectionPath,
  shouldHaveAddForComparisonAction,
  shouldHaveDeleteAction,
  shouldHaveMarkAsFinalAction,
  shouldHaveMentionInCommentAction,
  additionalActivityFields,
  activityPath,
  additionalMentionFields,
}) => {
  const classes = useStyles();
  const activityLogContext = useActivityLogState();
  const [, dispatch] = useGlobalAppState();
  const [actingAs] = useContext(ActingAs);
  const isAdmin = !actingAs;

  const getActivityLogUserData = useActivityLogUserData();

  const deleteDocumentActivity = useCallback(
    () =>
      addActivity(
        activityPath,
        createActivityObject({
          ...(additionalActivityFields || {}),
          changeType: ActivityChangeType.DELETE_FILE,
          by: getActivityLogUserData,
          documents: [item],
          internal: item.isInternal,
        }),
      ),
    [getActivityLogUserData, item, additionalActivityFields, activityPath],
  );

  const [removalInProgress, setRemovalInProgress] = useState(false); //used when file is being removed from the list

  // should check about internal field and checklist
  const handleMention = useCallback(
    () => activityLogContext.setState({ documentReference: item, ...(additionalMentionFields || {}) }),
    [activityLogContext, item, additionalMentionFields],
  );
  const markAsFinal = () => {};
  const selectForComparison = () => {};
  const onDelete = useCallback(
    () =>
      firebase
        .firestore()
        .collection(collectionPath)
        .doc(item.id)
        .delete(),
    [item.id, collectionPath],
  );
  const handleDeleteFile = useCallback(
    (item: ChecklistItemValueDocument | DocumentValue) => {
      setRemovalInProgress(true);
      try {
        if (!editRestriction(item.uploadedAt as Date)) {
          return dispatch({
            type: 'SHOW_ERROR_SNACKBAR',
            message: 'Failed to edit item - You cant change status after 30sec from last change!',
          });
        }
        const path = [storageBasePath, `${item.storedName}`].join('/');
        const storageRef = firebase.storage().ref();
        const documentRef = storageRef.child(encodeURI(path));

        documentRef
          .delete()
          .then(() => {
            console.debug('file deleted from storage ', path);
            return onDelete();
          })
          .then(() => {
            console.log('Everything resolved');
            return dispatch({
              type: SAVED_ACTION_SNACKBAR,
              storeToFirebase: () => deleteDocumentActivity(),
            });
          })
          .catch(error => {
            console.error('Failed to remove item - {error.message}', error);
          })
          .finally(() => {
            // remove item from the list in any case since if it is an error with the storage means file is already out
            setRemovalInProgress(false);
          });
      } catch (error) {
        setRemovalInProgress(false);
        dispatch({
          type: 'SHOW_ERROR_SNACKBAR',
          message: `Failed to remove item - ${error.message}!`,
        });
      }
    },
    [storageBasePath, onDelete, dispatch, item],
  );

  const copyFilenameToClipboard = () => {
    let dummy = document.createElement('textarea');
    document.body.appendChild(dummy);
    dummy.value = fileWithExt(item.name).name;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    dispatch({
      type: 'SHOW_INFO_SNACKBAR',
      message: 'Copied file name to clipboard!',
    });
  };

  return (
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
                {`${formatDistanceToNowConfigured(item.uploadedAt)} ${
                  isAdmin ? ` by ${isPlatformActivity(item.uploadedBy) ? 'Platform' : item.uploadedBy.firstName}` : ''
                }`}
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
          <IconButton size="small" onClick={copyFilenameToClipboard}>
            <AssignmentIcon />
          </IconButton>
          {isAdmin && shouldHaveAddForComparisonAction && (
            <IconButton size="small" aria-label="Add to Comparison" onClick={() => selectForComparison()}>
              <CompareIcon style={{ color: item.isSelectedForComparison ? '#F7BC06' : 'inherit' }} />
            </IconButton>
          )}
          {shouldHaveMentionInCommentAction && (
            <IconButton size="small" aria-label="Add Comment" onClick={handleMention}>
              <AddCommentIcon style={{ color: (item.mentionCount || 0) > 0 ? '#F7BC06' : 'inherit' }} />
            </IconButton>
          )}
          {shouldHaveDeleteAction && (
            <IconButton
              edge="end"
              size="small"
              aria-label="Remove File"
              onClick={event => {
                event.stopPropagation();
                handleDeleteFile(item);
              }}
              aria-labelledby={`fileListItem-${item.storedName}`}
            >
              <DeleteIcon />
            </IconButton>
          )}
          {removalInProgress && <CircularProgress size={42} className={classes.iconDeleteProgress} />}
          {shouldHaveMarkAsFinalAction && (
            <IconButton size="small" aria-label="Mark as final" onClick={() => markAsFinal()} disabled={!isAdmin}>
              <FlagIcon className={classes.final} style={{ color: item.final ? '#F7BC06' : 'inherit' }} />
            </IconButton>
          )}
        </div>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default BookingRequestDocumentListItem;

interface BookingRequestDocumentListItemProps {
  item: ChecklistItemValueDocument;
  storageBasePath: string;
  activityPath: string;
  collectionPath: string;
  shouldHaveCopyAction?: boolean;
  shouldHaveMentionInCommentAction?: boolean;
  shouldHaveDeleteAction?: boolean;
  shouldHaveAddForComparisonAction?: boolean;
  shouldHaveMarkAsFinalAction?: boolean;
  additionalActivityFields?: Partial<ActivityCreationProps>;
  additionalMentionFields?: Partial<ActivityLogContextProps>;
}
