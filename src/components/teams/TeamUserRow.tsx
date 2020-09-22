import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import React, { useCallback, useState } from 'react';
import { Team } from '../../model/Teams';
import invoke from 'lodash/fp/invoke';
import set from 'lodash/fp/set';
import UserRecord, { CUSTOMER_FACING_ROLES, UserRecordMin, UserRecordMinProperties } from '../../model/UserRecord';
import { firestore } from 'firebase';
import asArray from '../../utilities/asArray';
import useTeams from '../../hooks/useTeams';
import { formatDistanceToNow } from 'date-fns';
import { formatDistanceToNowConfigured } from '../../utilities/formattingHelpers';
import useAdminUsers from '../../hooks/useAdminUsers';
import UserInput from '../inputs/UserInput';
import firebase from '../../firebase';
import { pick } from 'lodash/fp';

interface Props {
  user: UserRecord;
}

const TeamUserRow: React.FC<Props> = ({ user, ...other }) => {
  const assignableUsers = useAdminUsers(CUSTOMER_FACING_ROLES);
  const onChange = useCallback(
    (selectedUser: UserRecordMin | null) => {
      firebase
        .firestore()
        .collection('users')
        .where('alphacomId', '==', user?.alphacomId)
        .get()
        .then(users =>
          users.docs
            .pop()
            ?.ref.set(
              { redirectedAdmin: selectedUser ? pick(UserRecordMinProperties)(selectedUser) : null },
              { merge: true },
            ),
        )
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
        <UserInput
          label="Redirect To"
          users={assignableUsers || []}
          onChange={(_, user) => onChange(user)}
          value={user.redirectedAdmin}
        />
      </TableCell>
    </TableRow>
  );
};

export default TeamUserRow;
