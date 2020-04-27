import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Box, createStyles, IconButton, makeStyles, Theme, Tooltip } from '@material-ui/core';
import Avatar from 'react-avatar';
import SendIcon from '@material-ui/icons/Send';
import debounce from 'lodash/fp/debounce';
import Mousetrap from 'mousetrap';
import { Mention, MentionItem, MentionsInput } from 'react-mentions';
import mentionsClassNames from '../bookings/checklist/mention.module.css';
import UserRecordContext from '../../contexts/UserRecordContext';
import ActingAs from '../../contexts/ActingAs';
import useAdminUsers from '../../hooks/useAdminUsers';

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

const QuoteWriteComment: React.FC<QuoteWriteCommentProp> = ({ onCommentSave }) => {
  const classes = useStyles();
  const [actingAs, setActingAs] = useContext(ActingAs);
  const [messageText, setMessageText] = useState('');
  const [mentions, setMentions] = useState<MentionItem[]>([]);
  const userRecord = useContext(UserRecordContext);
  const handleMessageTyping = useMemo(() => debounce(250, setMessageText), [setMessageText]);
  const [isAdmin, setIsAdmin] = useState(!actingAs);
  useEffect(() => {
    setIsAdmin(!actingAs);
  }, [actingAs]);
  const [isCustomerMessage, setIsCustomerMessage] = useState(!isAdmin);
  const inputRef = useRef<HTMLInputElement>(null);
  const admins = useAdminUsers();
  const [mousetrap, setMousetrap] = useState<MousetrapInstance>();

  const normalizedAdmins = useMemo(() => {
    return admins?.map(
      admin => ({ id: admin.emailAddress, display: `${admin.firstName} ${admin.lastName}` } as MentionItem),
    );
  }, [admins]);

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
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  useEffect(() => {
    return () => {
      mousetrap?.unbind(['ctrl+enter', 'command+enter']); // componentWillUnmount
    };
  }, []);

  const saveMessage = () => {
    onCommentSave(messageText, mentions, !isCustomerMessage);
    setMessageText('');
    // reset text on send
    if (inputRef && inputRef.current) {
      inputRef.current.value = '';
    }
    setIsCustomerMessage(!isAdmin);
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
        <MentionsInput
          classNames={mentionsClassNames}
          className="mentions"
          placeholder={'Write a comment...'}
          inputRef={inputRef}
          onChange={(event, newValue, newPlainTextValue, mentions) => {
            setMessageText(event.target.value);
            setMentions(mentions);
          }}
          value={messageText}
          allowSuggestionsAboveCursor={true}
        >
          <Mention
            trigger="@"
            data={normalizedAdmins}
            className={mentionsClassNames.mentions__mention}
            displayTransform={(id, display) => '@' + display}
          />
        </MentionsInput>
        <Tooltip title="Send">
          <IconButton color="primary" disabled={messageText.length < 1} onClick={() => saveMessage()}>
            <SendIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default QuoteWriteComment;

interface QuoteWriteCommentProp {
  onCommentSave: (messageBody: string, mentions: MentionItem[], internal: boolean) => void;
}
