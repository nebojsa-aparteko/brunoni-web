import React, { useContext, useState } from 'react';
import { Box, Button, createStyles, InputBase, makeStyles, Paper, Theme, Typography } from '@material-ui/core';
import Avatar from 'react-avatar';
import UserRecordContext from '../../../contexts/UserRecord';
import firebase from '../../../firebase';
import { ActivityType, CommentEntity } from './Comments';
import { ActivityLogUserData } from './ChecklistItemModel';

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
const WriteComment = ({ bookingId, isInternal }: WriteCommentProp) => {
  const classes = useStyles();
  const [inputInFocus, setInputInFocus] = useState(false);
  const [messageText, setMessageText] = useState('');

  const userRecord = useContext(UserRecordContext);
  const handleCommentSave = () => {
    const userActivityLogData = {
      firstName: userRecord?.firstName,
      lastName: userRecord?.lastName,
      alphacomClientId: userRecord?.alphacomClientId,
      alphacomId: userRecord?.alphacomId,
      emailAddress: userRecord?.emailAddress,
    } as ActivityLogUserData;
    firebase
      .firestore()
      .collection('bookings')
      .doc(bookingId)
      .collection('activity')
      .doc()
      .set({
        type: ActivityType.COMMENT,
        text: messageText,
        commentedAt: new Date(),
        commentedBy: userActivityLogData,
        isInternal: isInternal,
      } as CommentEntity)
      .then(_ => setMessageText(''))
      .catch(err => console.log(err));
  };
  return (
    <Box className={classes.writeCommentContainer}>
      <Avatar
        name={userRecord?.emailAddress}
        title={`${userRecord?.firstName} ${userRecord?.lastName}`}
        size="40"
        round={true}
      />
      <Paper variant="outlined" className={classes.writeComment} onClick={() => setInputInFocus(true)}>
        {!inputInFocus && <Typography variant="subtitle1">Write a comment...</Typography>}
        {inputInFocus && (
          <InputBase
            multiline
            autoFocus
            inputProps={{ 'aria-label': 'naked' }}
            placeholder="Write a comment..."
            onBlur={() => setInputInFocus(false)}
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
          />
        )}
        <Button variant="contained" disabled={messageText.length < 1} onClick={handleCommentSave}>
          Save
        </Button>
      </Paper>
    </Box>
  );
};

export default WriteComment;

interface WriteCommentProp {
  bookingId: string | undefined;
  isInternal: boolean;
}
