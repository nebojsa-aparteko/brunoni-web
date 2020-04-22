import React from 'react';
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
} from '@material-ui/core';
import DescriptionIcon from '@material-ui/icons/Description';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import AddCommentIcon from '@material-ui/icons/AddComment';
import DeleteIcon from '@material-ui/icons/Delete';
import { ChecklistItem, ChecklistItemValueDocument } from './ChecklistItemModel';
import { green } from '@material-ui/core/colors';
import { useActivityLogState } from './ActivityLogContext';

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
  }),
);

const DocumentListItem = ({ item, checklistItem, bookingId, index, removalInProgress, deleteFile }: Props) => {
  const classes = useStyles();
  const activityLogContext = useActivityLogState();

  const handleMention = () =>
    activityLogContext.setState({ documentReference: item, checklistReference: checklistItem });

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
          <Avatar>
            <DescriptionIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          id={`filelistitem-${bookingId}-${index}`}
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
            aria-labelledby={`filelistitem-${bookingId}-${index}`}
          >
            <DeleteIcon />
          </IconButton>
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
}
