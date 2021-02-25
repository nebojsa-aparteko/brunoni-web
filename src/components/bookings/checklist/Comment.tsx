import React from 'react';
import { Box, makeStyles, Theme } from '@material-ui/core';
import Avatar from 'react-avatar';
import { ActivityLogItem } from './ActivityModel';
import ActivityComment from './ActivityComment';
import { Booking } from '../../../model/Booking';
import { getFullName } from '../../../utilities/activityHelper';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: theme.spacing(1),
  },
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

const Comment = ({ activity, handleCommentClick, booking, ...other }: CommentProp) => {
  const classes = useStyles();

  return (
    <Box
      className={classes.container}
      style={{ cursor: handleCommentClick ? 'pointer' : 'initial' }}
      {...other}
      onClick={handleCommentClick}
    >
      <Box className={classes.rowContainer}>
        <Avatar name={getFullName(activity)} title={getFullName(activity)} size="30" round={true} />
        <Box display="flex" flexDirection="column" flex={1} ml={1}>
          <ActivityComment activity={activity} booking={booking} />
        </Box>
      </Box>
    </Box>
  );
};

export default Comment;

interface CommentProp {
  activity: ActivityLogItem;
  handleCommentClick?: () => void;
  booking?: Booking;
}
