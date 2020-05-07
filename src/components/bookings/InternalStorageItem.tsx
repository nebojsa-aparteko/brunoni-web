import React, { useState } from 'react';
import {
  Avatar,
  CircularProgress,
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
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import AddCommentIcon from '@material-ui/icons/AddComment';
import DeleteIcon from '@material-ui/icons/Delete';
import { ChecklistItemValueDocument } from './checklist/ChecklistItemModel';
import { green } from '@material-ui/core/colors';
import safeInvoke from '../../utilities/safeInvoke';

const useStyles = makeStyles((theme: Theme) => ({
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
}));

const InternalStorageItem: React.FC<Props> = ({ item, handleMention, handleDelete }) => {
  const classes = useStyles();

  const [removalInProgress, setRemovalInProgress] = useState(false);
  return (
    <ListItem>
      <a
        href={item.url}
        download={'AAAA' + item.name}
        // target="_blank"
        rel="noopener noreferrer"
        className={classes.fileItemLink}
      >
        <ListItemAvatar>
          <Avatar color="primary">
            <DescriptionIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          id={`filelistitem-${item.storedName}`}
          primary={item.name}
          secondary={
            <Typography variant="caption">
              {`${formatDistanceToNow(safeInvoke('toDate')(item.uploadedAt))} by ${item.uploadedBy.firstName}`}
            </Typography>
          }
        />
      </a>
      <ListItemSecondaryAction>
        <div className={classes.progressWrapper}>
          <IconButton
            size="small"
            aria-label="Add Comment"
            onClick={event => {
              event.stopPropagation();
              handleMention(item);
            }}
          >
            <AddCommentIcon />
          </IconButton>

          <IconButton
            edge="end"
            size="small"
            aria-label="Remove File"
            onClick={event => {
              event.stopPropagation();
              handleDelete(item, setRemovalInProgress);
            }}
            aria-labelledby={`filelistitem-${item.storedName}`}
          >
            <DeleteIcon />
          </IconButton>
          {removalInProgress && <CircularProgress size={42} className={classes.iconDeleteProgress} />}
        </div>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default InternalStorageItem;

interface Props {
  item: ChecklistItemValueDocument;
  handleDelete: (item: ChecklistItemValueDocument, setProgress: any) => void;
  handleMention: (item: ChecklistItemValueDocument) => void;
}
