import React from 'react';
import { Box, createStyles, makeStyles, Theme } from '@material-ui/core';
import Avatar from 'react-avatar';
import { ActivityLogItem } from './ActivityModel';
import ActivityComment from './ActivityComment';
import { Booking } from '../../../model/Booking';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
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
    adminMessage: {
      backgroundColor: '#eee',
    },
  }),
);

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
        <Avatar
          name={`${activity.by?.firstName} ${activity.by?.lastName}`}
          title={`${activity.by?.firstName} ${activity.by?.lastName}`}
          size="30"
          round={true}
        />
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
