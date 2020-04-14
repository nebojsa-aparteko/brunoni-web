import React from 'react';
import { Box, Typography, Paper, makeStyles, Theme, createStyles } from '@material-ui/core';
import Avatar from 'react-avatar';
import { CommentEntity } from './Comments';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { capitalCase } from 'change-case';
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
      marginLeft: theme.spacing(1),
      padding: theme.spacing(1),
      flex: 1,
      whiteSpace: 'normal',
    },
  }),
);

const Comment = ({ comment }: CommentProp) => {
  const classes = useStyles();
  return (
    <Box className={classes.container}>
      <Box className={classes.rowContainer}>
        <Avatar
          name={comment.commentedBy.emailAddress}
          title={`${comment.commentedBy.firstName} ${comment.commentedBy.lastName}`}
          size="40"
          round={true}
        />
        <Paper className={classes.comment}>
          <Box className={classes.rowContainer}>
            <Typography className={classes.name} color="textPrimary">
              {`${capitalCase(comment.commentedBy.firstName)} ${capitalCase(comment.commentedBy.lastName)}`}
            </Typography>
            <Typography color="textSecondary" variant="caption">{`${formatDistanceToNow(
              comment.commentedAt,
            )} ago`}</Typography>
          </Box>
          <Typography style={{ wordBreak: 'break-all' }}>{comment.text}</Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Comment;

interface CommentProp {
  comment: CommentEntity;
}
