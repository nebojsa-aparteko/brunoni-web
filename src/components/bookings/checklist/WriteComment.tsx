import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Box, createStyles, IconButton, Input, makeStyles, Paper, Theme, Tooltip } from '@material-ui/core';
import Avatar from 'react-avatar';
import UserRecordContext from '../../../contexts/UserRecord';
import SendIcon from '@material-ui/icons/Send';
import debounce from 'lodash/fp/debounce';
import Mousetrap from 'mousetrap';
import { useActivityLogState } from './ActivityLogContext';

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
      flexDirection: 'column',
    },
  }),
);

const WriteComment: React.FC<WriteCommentProp> = ({ onCommentSave }) => {
  const classes = useStyles();
  const [messageText, setMessageText] = useState('');
  const userRecord = useContext(UserRecordContext);
  const handleMessageTyping = useMemo(() => debounce(250, setMessageText), [setMessageText]);

  const inputRef = useRef<HTMLInputElement>();

  const [mousetrap, setMousetrap] = useState<MousetrapInstance>();

  const activityLogContext = useActivityLogState();

  useEffect(() => {
    console.log('binding');
    let moustrapInstance = new Mousetrap();
    moustrapInstance.stopCallback = function() {
      return false;
    };
    moustrapInstance.bind(['ctrl+enter', 'command+enter'], () => saveMessage());
    setMousetrap(moustrapInstance);
  }, [inputRef, messageText]);

  useEffect(() => {
    if (!activityLogContext.state) return;
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef, activityLogContext.state]);

  useEffect(() => {
    return () => {
      mousetrap?.unbind(['ctrl+enter', 'command+enter']); // componentWillUnmount
    };
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleMessageTyping(event.target.value);
  };

  const saveMessage = () => {
    onCommentSave(messageText);
    setMessageText('');
    // reset text on send
    if (inputRef && inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <Box display="flex" flexDirection="column">
      <Box className={classes.writeCommentContainer}>
        <Avatar
          name={`${userRecord?.firstName} ${userRecord?.lastName}`}
          title={`${userRecord?.firstName} ${userRecord?.lastName}`}
          size="30"
          round={true}
        />
        <Paper variant="outlined" component={Box} className={classes.writeComment}>
          <Input
            disableUnderline
            fullWidth
            onChange={handleChange}
            multiline
            inputRef={inputRef}
            placeholder="Write a comment..."
          />
        </Paper>
        <Tooltip title="Send">
          <IconButton color="primary" disabled={messageText.length < 1} onClick={() => saveMessage()}>
            <SendIcon />
          </IconButton>
        </Tooltip>
      </Box>
      {activityLogContext.state?.checklistReference && (
        <Box>
          Ref -{' '}
          <a href={`#${activityLogContext.state?.checklistReference?.id}`}>
            {activityLogContext.state?.checklistReference?.label}
          </a>
        </Box>
      )}
      {activityLogContext.state?.documentReference && (
        <Box>
          Doc -{' '}
          <a href={`#${activityLogContext.state?.documentReference?.url}`}>
            {activityLogContext.state?.documentReference?.name}
          </a>
        </Box>
      )}
    </Box>
  );
};

export default WriteComment;

interface WriteCommentProp {
  onCommentSave: (messageBody: string) => void;
}
