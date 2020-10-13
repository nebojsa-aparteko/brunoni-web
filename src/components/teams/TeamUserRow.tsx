import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import React, { useCallback, useMemo } from 'react';
import invoke from 'lodash/fp/invoke';
import UserRecord, { CUSTOMER_FACING_ROLES, UserRecordMin, UserRecordMinProperties } from '../../model/UserRecord';
import { formatDistanceToNowConfigured } from '../../utilities/formattingHelpers';
import useAdminUsers from '../../hooks/useAdminUsers';
import UserInput from '../inputs/UserInput';
import firebase from '../../firebase';
import { pick } from 'lodash/fp';
import UserNotificationRedirectionSwitch from '../UserNotificationRedirectionSwitch';

interface Props {
  user: UserRecord;
}

const TeamUserRow: React.FC<Props> = ({ user, ...other }) => {
  const assignableUsers = useAdminUsers(CUSTOMER_FACING_ROLES);
  const assignableUsersWithoutCurrent = useMemo(
    () => assignableUsers.filter(assignableUser => assignableUser.alphacomId !== user.alphacomId),
    [assignableUsers, user],
  );
  console.log(user);
  const onChange = useCallback(
    (selectedUser: UserRecordMin | null) => {
      firebase
        .firestore()
        .collection('users')
        .doc(user.id)
        .set({ redirectedAdmin: selectedUser ? pick(UserRecordMinProperties)(selectedUser) : null }, { merge: true })
        .then(_ => console.log('Saved'));
    },
    [user],
  );
  return (
    <TableRow {...other}>
      <TableCell component="th" scope="row">
        {user.firstName} {user.lastName}
      </TableCell>
      <TableCell align="right">{user.emailAddress}</TableCell>
      <TableCell align="right">{user.role}</TableCell>
      <TableCell align="right">
        {user.lastSession ? formatDistanceToNowConfigured(invoke('toDate')(user.lastSession)) : 'never'}
      </TableCell>
      <TableCell align="right">
        <UserNotificationRedirectionSwitch userUid={user.id || ''} user={user} />
      </TableCell>
      <TableCell align="right">
        <UserInput
          label="Redirect To"
          users={assignableUsersWithoutCurrent || []}
          onChange={(_, user) => onChange(user)}
          value={user.redirectedAdmin}
        />
      </TableCell>
    </TableRow>
  );
};

export default TeamUserRow;
