import React, { Fragment } from 'react';
import { Box, Button, ListItemText, makeStyles, Paper, Theme, Typography } from '@material-ui/core';
import { ActivityLogItem } from './ActivityModel';
import asArray from '../../../utilities/asArray';
import DateFormattedText from '../../DateFormattedText';
import { getFullName } from '../../../utilities/activityHelper';
import CommentInput from '../../CommentInput';
import { Booking } from '../../../model/Booking';

const useStyles = makeStyles((theme: Theme) => ({
  rowContainer: {
    display: 'flex',
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    marginRight: theme.spacing(1),
  },
  comment: {
    padding: theme.spacing(1),
    flex: 1,
    whiteSpace: 'normal',
  },
}));

const ActivityComment = ({ activity, showInput, setShowInput, setNewComment, booking }: ActivityWithCommentProp) => {
  const classes = useStyles();

  const handleCancel = () => {
    setShowInput && setShowInput(false);
    setNewComment && setNewComment(undefined);
  };

  return (
    <Fragment>
      <ListItemText
        primary={
          <Box display="flex">
            {getFullName(activity)}{' '}
            <Box ml={0.5}>
              <DateFormattedText date={activity.at} />
            </Box>
          </Box>
        }
        secondary={
          <Paper className={classes.comment}>
            {showInput && booking && setShowInput && setNewComment ? (
              <Box style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
                <CommentInput
                  booking={booking}
                  onInputChange={message => setNewComment(message.messagePlain)}
                  // previousMessage={activity.comment}
                />
                <Box style={{ display: 'flex', flexDirection: 'row', marginRight: 8, marginLeft: 'auto' }}>
                  <Button size="small" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button size="small" variant="contained" color="primary" onClick={() => setShowInput(false)}>
                    Save
                  </Button>
                </Box>
              </Box>
            ) : (
              <Typography>{activity?.comment}</Typography>
            )}
            {activity.checklistItem && (
              <Box>
                Ref - <a href={`#${activity.checklistItem?.id}`}>{activity.checklistItem?.label}</a>
              </Box>
            )}
            {activity.documents && (
              <Box>
                Doc -{' '}
                {asArray(activity.documents).map(item => (
                  <a href={`${item.url}`} key={`doc-${item.url}`} target="_blank" rel="noopener noreferrer">
                    {item.name}
                  </a>
                ))}
              </Box>
            )}
          </Paper>
        }
      />
    </Fragment>
  );
};

export default ActivityComment;

interface ActivityWithCommentProp {
  activity: ActivityLogItem;
  showInput?: boolean;
  setShowInput?: (value: boolean) => void;
  setNewComment?: (text: string | undefined) => void;
  booking?: Booking;
}
