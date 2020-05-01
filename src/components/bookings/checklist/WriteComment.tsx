import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Checkbox,
  createStyles,
  FormControlLabel,
  IconButton,
  makeStyles,
  Theme,
  Tooltip,
} from '@material-ui/core';
import Avatar from 'react-avatar';
import UserRecordContext from '../../../contexts/UserRecordContext';
import SendIcon from '@material-ui/icons/Send';
import Mousetrap from 'mousetrap';
import { useActivityLogState } from './ActivityLogContext';
import ActingAs from '../../../contexts/ActingAs';
import CloseIcon from '@material-ui/icons/Close';
import { Mention, MentionItem, MentionsInput } from 'react-mentions';
import useAdminUsers from '../../../hooks/useAdminUsers';
import mentionsClassNames from './mention.module.css';
import useTeams from '../../../hooks/useTeams';

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
  const actingAs = useContext(ActingAs)[0];
  const [messageText, setMessageText] = useState('');
  const [mentions, setMentions] = useState<MentionItem[]>([]);
  const userRecord = useContext(UserRecordContext);
  const [isAdmin, setIsAdmin] = useState(!actingAs);
  useEffect(() => {
    setIsAdmin(!actingAs);
  }, [actingAs]);
  const [isCustomerMessage, setIsCustomerMessage] = useState(!isAdmin);
  const inputRef = useRef<HTMLInputElement>(null);
  const admins = useAdminUsers();
  const teams = useTeams();

  const activityLogContext = useActivityLogState();
  const normalizedAdmins = useMemo(() => {
    return admins
      ?.map(admin => ({ id: admin.emailAddress, display: `${admin.firstName} ${admin.lastName}` } as MentionItem))
      .concat(teams?.map(team => ({ id: team.id, display: `${team.name}` } as MentionItem)));
  }, [admins, teams]);

  useEffect(() => {
    let moustrapInstance = new Mousetrap();
    moustrapInstance.stopCallback = function() {
      return false;
    };
    moustrapInstance.bind(['ctrl+enter', 'command+enter'], () => saveMessage());
    return () => {
      moustrapInstance?.unbind(['ctrl+enter', 'command+enter']); // componentWillUnmount
    };
  }, [inputRef]);

  useEffect(() => {
    if (!activityLogContext.state) return;
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef, activityLogContext.state]);

  const handleDeleteReferences = () => activityLogContext.setState({});

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
          placeholder={activityLogContext.state?.rejected ? 'Please write reason of rejection' : 'Write a comment...'}
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
      {isAdmin && (
        <FormControlLabel
          control={
            <Checkbox
              checked={isCustomerMessage}
              onChange={_ => {
                setIsCustomerMessage(prevState => !prevState);
              }}
              name="customerCommentCheckbox"
              color="primary"
            />
          }
          label="Share publicly"
        />
      )}
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
      {Object.keys(activityLogContext.state || {}).length > 0 && (
        <IconButton onClick={handleDeleteReferences}>
          <CloseIcon />
        </IconButton>
      )}
    </Box>
  );
};

export default WriteComment;

interface WriteCommentProp {
  onCommentSave: (messageBody: string, mentions: MentionItem[], internal: boolean) => void;
}
