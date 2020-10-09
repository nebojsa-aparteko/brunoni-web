import React, { useContext, useEffect, useMemo, useState } from 'react';
import mentionsClassNames from './bookings/checklist/mention.module.css';
import { Mention, MentionItem, MentionsInput } from 'react-mentions';
import ActingAs from '../contexts/ActingAs';
import { Booking } from '../model/Booking';
import firebase from '../firebase';
import UserRecord from '../model/UserRecord';
import useAdminUsers from '../hooks/useAdminUsers';
import useTeams from '../hooks/useTeams';
import { RejectionInput } from './bookings/documentApproval/RejectionModal';

const CommentInput: React.FC<Props> = ({ booking, onInputChange }) => {
  const [messageText, setMessageText] = useState('');
  const actingAs = useContext(ActingAs)[0];
  const [assignedCustomerUser, setAssignedCustomerUser] = useState<UserRecord | undefined>(undefined);
  const [assignedUser, setAssignedUser] = useState<UserRecord | undefined>(undefined);
  const admins = useAdminUsers();
  const teams = useTeams();

  const usersToMention = useMemo<MentionItem[]>(() => {
    //this means if user is admin
    if (!actingAs) {
      const tempUsers = admins
        ?.map(admin => ({ id: admin.id, display: `${admin.firstName} ${admin.lastName}` } as MentionItem))
        .concat(teams?.map(team => ({ id: team.id, display: `${team.name}` } as MentionItem)));
      return assignedCustomerUser
        ? tempUsers.concat([
            {
              id: assignedCustomerUser.id,
              display: `${assignedCustomerUser?.firstName} ${assignedCustomerUser?.lastName}`,
            } as MentionItem,
          ])
        : tempUsers;
    } else {
      return assignedUser
        ? [
            {
              id: assignedUser.id,
              display: `${assignedUser.firstName} ${assignedUser.lastName}`,
            } as MentionItem,
          ]
        : [];
    }
  }, [actingAs, assignedUser, teams, admins, assignedCustomerUser]);

  useEffect(() => {
    firebase
      .firestore()
      .collection('users')
      .where('alphacomId', '==', booking?.assignedUser?.alphacomId || '')
      .where('emailAddress', '==', booking?.assignedUser?.emailAddress || '')
      .get()
      .then(doc => {
        if (doc.docs.length > 0) setAssignedUser({ ...doc.docs[0].data(), id: doc.docs[0].id } as UserRecord);
      });
  }, [booking.assignedUser]);

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
  }, [booking.assignedCustomerUser]);
  return (
    <MentionsInput
      classNames={mentionsClassNames}
      className="mentions"
      placeholder={'Write here...'}
      onChange={(event, newValue, newPlainTextValue, mentions) => {
        onInputChange({ message: newValue, messagePlain: newPlainTextValue, mentions });
        setMessageText(newValue);
      }}
      value={messageText}
      allowSuggestionsAboveCursor={true}
    >
      <Mention
        trigger="@"
        data={usersToMention}
        className={mentionsClassNames.mentions__mention}
        displayTransform={(id, display) => '@' + display}
      />
    </MentionsInput>
  );
};

export default CommentInput;

interface Props {
  booking: Booking;
  onInputChange: (input: RejectionInput) => void;
}
