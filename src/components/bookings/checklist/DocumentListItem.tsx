import React, { useCallback, useContext } from 'react';
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
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import AddCommentIcon from '@material-ui/icons/AddComment';
import DeleteIcon from '@material-ui/icons/Delete';
import {
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
      return 'Rejected';
  }
};

const DocumentListItem = ({
  item,
  checklistItem,
  bookingId,
  index,
  removalInProgress,
  deleteFile,
  changeStatus,
  internal,
}: Props) => {
  const classes = useStyles();
  const activityLogContext = useActivityLogState();
  const userRecord = useContext(UserRecordContext);
  const [actingAs] = useContext(ActingAs);
  const isAdmin = !actingAs;
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
  const handleMention = () =>
    activityLogContext.setState({ documentReference: item, checklistReference: checklistItem });

  const checklistCheckedRule = () => checklistItem.checked;

  return (
    <ListItem key={`filelistitem-${bookingId}-${index}`}>
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
          id={`filelistitem-${bookingId}-${index}`}
          primary={item.name}
          secondary={
            <Box display="flex" flexDirection="column">
              <Typography variant="caption">
                {`${formatDistanceToNow(item.uploadedAt)} by ${item.uploadedBy.firstName}`}
              </Typography>
              {item.status?.at && (
                <Typography variant="caption">
                  {`${findTextForStatusType(item.status?.type)} ${formatDistanceToNow(new Date())} by ${
                    item.status?.by?.firstName
                  }`}
                </Typography>
              )}
            </Box>
          }
        />
      </a>
      <ListItemSecondaryAction>
        <div className={classes.progressWrapper}>
          <IconButton size="small" aria-label="Add Comment" onClick={handleMention}>
            <AddCommentIcon />
          </IconButton>
          {userRecord?.emailAddress === item.uploadedBy.emailAddress &&
            item.status?.type !== ChecklistItemValueDocumentStatusType.APPROVED &&
            editRestriction(item.uploadedAt) && (
              <IconButton
                edge="end"
                size="small"
                aria-label="Remove File"
                onClick={() => deleteFile(item)}
                aria-labelledby={`filelistitem-${bookingId}-${index}`}
                disabled={checklistCheckedRule()}
              >
                <DeleteIcon />
              </IconButton>
            )}
          {((internal && isAdmin) || (!internal && !isAdmin)) &&
            (item.status?.at ? editRestriction(item.status.at) : true) &&
            (!internal && !isAdmin ? userRecord?.emailAddress !== item.uploadedBy.emailAddress : true) &&
            !checklistCheckedRule() && (
              <Box display="flex" flexDirection="column">
                <Link
                  disabled={item.status?.type === ChecklistItemValueDocumentStatusType.DEFAULT}
                  component="button"
                  variant="body2"
                  onClick={() => {
                    changeStatus({
                      ...item,
                      status: {
                        type: ChecklistItemValueDocumentStatusType.DEFAULT,
                        by: getActivityLogUserData(),
                        at: new Date(),
                      },
                    });
                    activityLogContext.setState(undefined);
                  }}
                >
                  Pending
                </Link>
                <Link
                  disabled={item.status?.type === ChecklistItemValueDocumentStatusType.APPROVED}
                  component="button"
                  variant="body2"
                  onClick={() => {
                    changeStatus({
                      ...item,
                      status: {
                        type: ChecklistItemValueDocumentStatusType.APPROVED,
                        by: getActivityLogUserData(),
                        at: new Date(),
                      },
                    });
                    activityLogContext.setState(undefined);
                  }}
                >
                  Approve
                </Link>
                <Link
                  disabled={item.status?.type === ChecklistItemValueDocumentStatusType.REJECTED}
                  component="button"
                  variant="body2"
                  onClick={() => {
                    changeStatus({
                      ...item,
                      status: {
                        type: ChecklistItemValueDocumentStatusType.REJECTED,
                        by: getActivityLogUserData(),
                        at: new Date(),
                      },
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
          {removalInProgress && <CircularProgress size={42} className={classes.iconDeleteProgress} />}
        </div>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default DocumentListItem;

export interface Props {
  item: ChecklistItemValueDocument;
  checklistItem: ChecklistItem;
  bookingId: string;
  index: number;
  removalInProgress: boolean;
  deleteFile: (item: ChecklistItemValueDocument) => void;
  changeStatus: (item: ChecklistItemValueDocument) => void;
  internal: boolean;
}
