import React from 'react';
import { Box, Typography, Paper, makeStyles, Theme, createStyles } from '@material-ui/core';
import Avatar from 'react-avatar';
import { CommentEntity } from './Comments';
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
    },
    name: {
      marginRight: theme.spacing(1),
    },
    comment: {
      marginLeft: theme.spacing(1),
      padding: theme.spacing(1),
    },
  }),
);

const Comment = ({ comment }: CommentProp) => {
  const classes = useStyles();
  return (
    <Box className={classes.container}>
      <Box className={classes.rowContainer}>
        <Typography className={classes.name}>{comment.uploadedBy.firstName + comment.uploadedBy.lastName}</Typography>
        <Typography>Apr 1 at 9:24 PM</Typography>
      </Box>
      <Box className={classes.rowContainer}>
        <Avatar name={'Filip Antic'} title={`Filip Antic`} size="40" round={true} />
        <Paper className={classes.comment}>
          <Typography>{comment.text}</Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Comment;

interface CommentProp {
  comment: CommentEntity;
}
