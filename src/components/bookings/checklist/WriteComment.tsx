import React, { useContext, useState } from 'react';
import { Box, Button, createStyles, InputBase, makeStyles, Paper, Theme, Typography } from '@material-ui/core';
import Avatar from 'react-avatar';
import UserRecordContext from '../../../contexts/UserRecord';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    writeCommentContainer: {
      width: '100%',
      display: 'flex',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing(1),
    },
    writeComment: {
      marginLeft: theme.spacing(1),
      padding: theme.spacing(1),
      cursor: 'pointer',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    },
  }),
);
const WriteComment = () => {
  const classes = useStyles();
  const [inputInFocus, setInputInFocus] = useState(false);
  const userRecord = useContext(UserRecordContext);
  const handleCommentSave = () => {};
  return (
    <Box className={classes.writeCommentContainer}>
      <Avatar name={'Filip Antic'} title={`Filip Antic`} size="40" round={true} />
      <Paper variant="outlined" className={classes.writeComment} onClick={() => setInputInFocus(true)}>
        {!inputInFocus && <Typography variant="subtitle1">Write a comment...</Typography>}
        {inputInFocus && (
          <InputBase
            multiline
            autoFocus
            inputProps={{ 'aria-label': 'naked' }}
            placeholder="Write a comment..."
            onBlur={() => setInputInFocus(false)}
          />
        )}
        <Button variant="contained" disabled onClick={handleCommentSave}>
          Save
        </Button>
      </Paper>
    </Box>
  );
};

export default WriteComment;
