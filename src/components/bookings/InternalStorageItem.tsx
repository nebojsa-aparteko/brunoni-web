import React, { useState } from 'react';
import {
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Theme,
  Tooltip,
  Typography,
} from '@material-ui/core';
import DescriptionIcon from '@material-ui/icons/Description';
import AddCommentIcon from '@material-ui/icons/AddComment';
import DeleteIcon from '@material-ui/icons/Delete';
import { ChecklistItemValueDocument } from './checklist/ChecklistItemModel';
import { green } from '@material-ui/core/colors';
import safeInvoke from '../../utilities/safeInvoke';
import theme from '../../theme';
import { isPlatformActivity } from '../../utilities/activityHelper';
import CompareIcon from '@material-ui/icons/Compare';
import DateFormattedText from '../DateFormattedText';
import EmailIcon from '@material-ui/icons/Email';

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

const InternalStorageItem: React.FC<Props> = ({ item, handleMention, handleDelete, handleDialogOpen }) => {
  const classes = useStyles();

  const [removalInProgress, setRemovalInProgress] = useState(false);
  return (
    <ListItem>
      <a
        href={item.url}
        download={item.name}
        rel="noopener noreferrer"
        className={classes.fileItemLink}
        target="_blank"
      >
        <ListItemAvatar>
          <Avatar color="primary">
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
            <Box style={{ cursor: 'default' }} onClick={e => e.preventDefault()} display={'flex'} alignItems={'center'}>
              <DateFormattedText date={safeInvoke('toDate')(item.uploadedAt)} />
              <Typography style={{ marginLeft: '.2em' }} variant="caption">
                {isPlatformActivity(item.uploadedBy) ? 'by Platform' : `by ${item.uploadedBy.firstName}`}
              </Typography>
              {item.bookingEmlStatus && (
                <Box ml={1}>
                  {item.bookingEmlStatus === 'sent' ? (
                    <Tooltip title={`Email sent ${item.bookingTimestamp ? 'at ' + item.bookingTimestamp : ''}`}>
                      <EmailIcon htmlColor={'rgba(0,200,81)'} />
                    </Tooltip>
                  ) : (
                    <Tooltip title={`Email failed ${item.bookingTimestamp ? 'at ' + item.bookingTimestamp : ''}`}>
                      <EmailIcon htmlColor={'rgba(200,0,0)'} />
                    </Tooltip>
                  )}
                </Box>
              )}
            </Box>
            // <Typography variant="caption">
            //   {`${formatDistanceToNowConfigured(safeInvoke('toDate')(item.uploadedAt))} by ${
            //     isPlatformActivity(item.uploadedBy) ? 'Platform' : item.uploadedBy.firstName
            //   }`}
            // </Typography>
          }
        />
      </a>
      <ListItemSecondaryAction>
        <Box display={'flex'} alignItems={'center'} className={classes.progressWrapper}>
          {handleDialogOpen && (
            <IconButton size="small" aria-label="Add to Comparison" onClick={() => handleDialogOpen(item)}>
              <CompareIcon />
            </IconButton>
          )}
          {handleMention && (
            <IconButton
              size="small"
              aria-label="Add Comment"
              onClick={event => {
                event.stopPropagation();
                handleMention(item);
              }}
            >
              {/*<Badge badgeContent={item.mentionCount || 0} color="primary">*/}
              <AddCommentIcon style={{ color: (item.mentionCount || 0) > 0 ? '#F7BC06' : 'inherit' }} />
              {/*</Badge>*/}
            </IconButton>
          )}

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
        </Box>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default InternalStorageItem;

interface Props {
  item: ChecklistItemValueDocument;
  handleDelete: (item: ChecklistItemValueDocument, setProgress: any) => void;
  handleMention?: (item: ChecklistItemValueDocument) => void;
  handleDialogOpen?: (document: ChecklistItemValueDocument) => void;
}
