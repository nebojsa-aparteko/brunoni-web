import React from 'react';
import { Box, createStyles, makeStyles, Theme } from '@material-ui/core';
import Avatar from 'react-avatar';
import { ActivityLogItem } from './ActivityModel';
import { makeActivityRepresentation } from './Activity';
import ActivityComment from './ActivityComment';

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

const ActivityWithComment = ({ activity, handleCommentClick, ...other }: ActivityWithCommentProp) => {
  const classes = useStyles();
  // const htmlComment = useMemo(() => comment?.comment?.replaceAll('\n', '<br/>'), [comment.comment]);
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
          <Box display="flex" flexDirection="column" ml={1}>
            {makeActivityRepresentation(activity)}
          </Box>
          {activity.comment && activity.comment.trim() !== '' ? <ActivityComment activity={activity} /> : null}
        </Box>
      </Box>
    </Box>
  );
};

export default ActivityWithComment;

interface ActivityWithCommentProp {
  activity: ActivityLogItem;
  handleCommentClick?: () => void;
  handleEdit?: () => void;
  handleDelete?: () => void;
}
