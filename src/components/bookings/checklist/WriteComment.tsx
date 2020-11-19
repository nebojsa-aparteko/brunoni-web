import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Checkbox, createStyles, FormControlLabel, IconButton, makeStyles, Theme } from '@material-ui/core';
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
import { Booking } from '../../../model/Booking';
import firebase from '../../../firebase';
import UserRecord from '../../../model/UserRecord';
import { Quote } from '../../../providers/QuoteGroupsProvider';

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

const WriteComment: React.FC<WriteCommentProp> = ({ onCommentSave, booking, quote, isAccounting }) => {
  const classes = useStyles();
  const actingAs = useContext(ActingAs)[0];
  const [messageText, setMessageText] = useState('');
  const [messageTextPlain, setMessageTextPlain] = useState('');
  const [mentions, setMentions] = useState<MentionItem[]>([]);
  const [assignedCustomerUser, setAssignedCustomerUser] = useState<UserRecord | undefined>(undefined);
  const [assignedUser, setAssignedUser] = useState<UserRecord | undefined>(undefined);
  const userRecord = useContext(UserRecordContext);
  useEffect(() => {
    firebase
      .firestore()
      .collection('users')
      .where('alphacomId', '==', booking?.assignedCustomerUser?.alphacomId || '')
      .where('emailAddress', '==', booking?.assignedCustomerUser?.emailAddress || '')
      .get()
      .then(doc => {
        if (doc.docs.length > 0) setAssignedCustomerUser({ ...doc.docs[0].data(), id: doc.docs[0].id } as UserRecord);
      });
    firebase
      .firestore()
      .collection('users')
      .where('alphacomId', '==', booking?.assignedUser?.alphacomId || '')
      .where('emailAddress', '==', booking?.assignedUser?.emailAddress || '')
      .get()
      .then(doc => {
        if (doc.docs.length > 0) setAssignedUser({ ...doc.docs[0].data(), id: doc.docs[0].id } as UserRecord);
      });
  }, [booking]);

  useEffect(() => {
    if (quote) {
      firebase
        .firestore()
        .collection('users')
        .where('alphacomId', '==', quote?.userId || '')
        .get()
        .then(doc => {
          if (doc.docs.length > 0) setAssignedCustomerUser({ ...doc.docs[0].data(), id: doc.docs[0].id } as UserRecord);
        });
      firebase
        .firestore()
        .collection('users')
        .where('alphacomId', '==', quote?.assignedTo?.alphacomId || '')
        .get()
        .then(doc => {
          if (doc.docs.length > 0) setAssignedUser({ ...doc.docs[0].data(), id: doc.docs[0].id } as UserRecord);
        });
    }
  }, [quote]);

  const [isAdmin, setIsAdmin] = useState(!actingAs);
  useEffect(() => {
    setIsAdmin(!actingAs);
  }, [actingAs]);
  const [isCustomerMessage, setIsCustomerMessage] = useState(!isAdmin);
  const inputRef = useRef<HTMLInputElement>(null);
  const submitButtonRf = useRef<HTMLButtonElement>(null);
  const admins = useAdminUsers();
  const teams = useTeams();

  const activityLogContext = useActivityLogState();
  const normalizedAdmins = useMemo(() => {
    if (isAdmin) {
      if (assignedCustomerUser) {
        return admins
          ?.map(admin => ({ id: admin.id, display: `${admin.firstName} ${admin.lastName}` } as MentionItem))
          .concat(teams?.map(team => ({ id: team.id, display: `${team.name}` } as MentionItem)))
          .concat([
            {
              id: assignedCustomerUser.id,
              display: `${assignedCustomerUser?.firstName} ${assignedCustomerUser?.lastName}`,
            } as MentionItem,
          ]);
      }

      return admins
        ?.map(admin => ({ id: admin.id, display: `${admin.firstName} ${admin.lastName}` } as MentionItem))
        .concat(teams?.map(team => ({ id: team.id, display: `${team.name}` } as MentionItem)));
    } else {
      if (!assignedUser) {
        return [];
      }
      return [
        {
          id: assignedUser.id,
          display: `${assignedUser.firstName} ${assignedUser.lastName}`,
        } as MentionItem,
      ];
    }
  }, [admins, teams, assignedCustomerUser, assignedUser, isAdmin]);

  useEffect(() => {
    if (inputRef && inputRef.current && submitButtonRf && submitButtonRf.current) {
      let moustrapInstance = new Mousetrap(inputRef.current);
      moustrapInstance.stopCallback = function() {
        return false;
      };
      moustrapInstance.bind(['ctrl+enter', 'command+enter'], () => submitButtonRf?.current?.click());
      return () => {
        moustrapInstance?.unbind(['ctrl+enter', 'command+enter']);
      };
    }
  }, [inputRef, submitButtonRf]);

  useEffect(() => {
    if (!activityLogContext.state) return;
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef, activityLogContext.state]);

  const handleDeleteReferences = () => activityLogContext.setState({});

  const saveMessage = () => {
    onCommentSave(messageTextPlain, mentions, !isCustomerMessage);
    updateMessageText('', '', []);
    // reset text on send
    if (inputRef && inputRef.current) {
      inputRef.current.value = '';
    }
    setIsCustomerMessage(!isAdmin);
  };

  const updateMessageText = (message: string, messagePlain: string, mentions: MentionItem[]) => {
    setMessageText(message);
    setMessageTextPlain(messagePlain);
    setMentions(mentions);
  };

  return (
    <Box id="commentInputField" display="flex" flexDirection="column">
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
          placeholder={
            activityLogContext.state?.rejected ? 'Please write reason of revision need' : 'Write a comment...'
          }
          inputRef={inputRef}
          onChange={(event, newValue, newPlainTextValue, mentions) => {
            updateMessageText(newValue, newPlainTextValue, mentions);
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
        <IconButton color="primary" disabled={messageText.length < 1} onClick={saveMessage} buttonRef={submitButtonRf}>
          <SendIcon />
        </IconButton>
      </Box>
      {isAdmin && !isAccounting && (
        <FormControlLabel
          control={
            <Checkbox
              checked={isCustomerMessage}
              disabled={activityLogContext.state?.internal}
              onChange={_ => {
                setIsCustomerMessage(prevState => !prevState);
              }}
              name="customerCommentCheckbox"
              color="primary"
            />
          }
          label={
            activityLogContext.state?.internal
              ? 'To share publicly, remove internal document mention'
              : 'Share publicly'
          }
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
          <a
            href={`${activityLogContext.state?.documentReference?.url}`}
            download={activityLogContext.state?.documentReference?.name}
            rel="noopener noreferrer"
          >
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
  booking?: Booking;
  quote?: Quote;
  isAccounting?: boolean;
}
