import React from 'react';
import { Box, Typography, Paper, makeStyles, Theme, createStyles, Link } from '@material-ui/core';
import Avatar from 'react-avatar';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { capitalCase } from 'change-case';
import { ActivityLogItem } from './ActivityModel';
import classNames from 'classnames';

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
      backgroundColor: '#ccc',
    },
  }),
);

const Comment = ({ comment }: CommentProp) => {
  const classes = useStyles();
  return (
    <Box className={classes.container}>
      <Box className={classes.rowContainer}>
        <Avatar
          name={`${comment.by.firstName} ${comment.by.lastName}`}
          title={`${comment.by.firstName} ${comment.by.lastName}`}
          size="30"
          round={true}
        />
        <Box display="flex" flexDirection="column" flex={1} ml={1}>
          <Paper className={classNames(classes.comment, comment.isInternal ? classes.adminMessage : '')}>
            <Box className={classes.rowContainer}>
              <Typography className={classes.name} color="textPrimary">
                {`${capitalCase(comment.by.firstName)} ${capitalCase(comment.by.lastName)}`}
              </Typography>
              <Typography color="textSecondary" variant="caption">{`${formatDistanceToNow(
                comment.at,
              )} ago`}</Typography>
            </Box>
            <Typography style={{ wordBreak: 'break-word' }}>{comment.comment}</Typography>
            {comment.checklistItem && (
              <Box>
                Ref - <a href={`#${comment.checklistItem.id}`}>{comment.checklistItem.label}</a>
              </Box>
            )}
            {comment.documents && (
              <Box>
                Doc - <a href={`#${comment.documents[0].url}`}>{comment.documents[0].name}</a>
              </Box>
            )}
          </Paper>
          {false && (
            <Box display="flex">
              <Link
                component="button"
                variant="body2"
                onClick={() => {
                  console.info("I'm a button.");
                }}
              >
                Edit
              </Link>
              -
              <Link
                component="button"
                variant="body2"
                onClick={() => {
                  console.info("I'm a button.");
                }}
              >
                Delete
              </Link>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Comment;

interface CommentProp {
  comment: ActivityLogItem;
  handleEdit?: () => void;
  handleDelete?: () => void;
}
