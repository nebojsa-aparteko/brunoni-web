import React from 'react';
import { Box, Button, createStyles, makeStyles, Paper, Theme, Typography } from '@material-ui/core';
import { capitalCase } from 'change-case';
import { ActivityLogItem } from './ActivityModel';
import classNames from 'classnames';
import asArray from '../../../utilities/asArray';
import DateFormattedText from '../../DateFormattedText';
import CommentInput from '../../CommentInput';
import { Booking } from '../../../model/Booking';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
    adminMessage: {
      backgroundColor: '#eee',
    },
  }),
);

const ActivityComment = ({ activity, showInput, setShowInput, setNewComment, booking }: ActivityWithCommentProp) => {
  const classes = useStyles();

  const handleCancel = () => {
    setShowInput && setShowInput(false);
    setNewComment && setNewComment(undefined);
  };

  return (
    <Paper className={classNames(classes.comment, activity.isInternal ? classes.adminMessage : '')}>
      <Box className={classes.rowContainer}>
        <Typography className={classes.name} color="textPrimary">
          {`${capitalCase(activity.by.firstName)} ${capitalCase(activity.by.lastName)}`}
        </Typography>
        <DateFormattedText date={activity.at} />
      </Box>
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
        <Typography style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{activity?.comment}</Typography>
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
