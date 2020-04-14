import React, { useContext, useState } from 'react';
import { Box, createStyles, IconButton, Input, makeStyles, Paper, Theme, Tooltip } from '@material-ui/core';
import Avatar from 'react-avatar';
import UserRecordContext from '../../../contexts/UserRecord';
import firebase from '../../../firebase';
import { ActivityType, CommentEntity } from './Comments';
import { ActivityLogUserData } from './ChecklistItemModel';
import SendIcon from '@material-ui/icons/Send';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    writeCommentContainer: {
      width: '100%',
      display: 'flex',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing(1),
      flexDirection: 'row',
    },
    writeComment: {
      marginLeft: theme.spacing(1),
      padding: theme.spacing(1),
      cursor: 'pointer',
      flex: 1,
      display: 'flex',
      flexDirection: 'row',
    },
  }),
);
const WriteComment = ({ bookingId, isInternal }: WriteCommentProp) => {
  const classes = useStyles();
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
      <Paper variant="outlined" component={Box} className={classes.writeComment}>
        <Input
          disableUnderline
          fullWidth
          onChange={e => setMessageText(e.target.value)}
          multiline
          autoFocus
          placeholder="Write a comment..."
          value={messageText}
        />
      </Paper>
      <Tooltip title="Send">
        <IconButton color="primary" disabled={messageText.length < 1} onClick={handleCommentSave}>
          <SendIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default WriteComment;

interface WriteCommentProp {
  bookingId: string | undefined;
  isInternal: boolean;
}
