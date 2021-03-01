import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import React, { useCallback, useMemo } from 'react';
import { ADMIN_ROLES, UserRecordMin } from '../../model/UserRecord';
import useAdminUsers from '../../hooks/useAdminUsers';
import UserInput from '../inputs/UserInput';
import firebase from '../../firebase';
import { Checkbox } from '@material-ui/core';
import { ReassignmentRule } from '../../model/ReassignmentRule';
import useUserByAlphacomId from '../../hooks/useUserByAlphacomId';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';

const ReassignUserRow: React.FC<Props> = ({ rule, selected, onSelectRow, ...other }) => {
  const assignableUsers = useAdminUsers(ADMIN_ROLES);
  const assignableUsersWithoutCurrent = useMemo(
    () => assignableUsers.filter(assignableUser => assignableUser.alphacomId !== rule.agentId),
    [assignableUsers, rule],
  );
  const onReassignedClientChange = useCallback(
    (selectedUser: UserRecordMin | null) => {
      firebase
        .firestore()
        .collection('reassignment-rules')
        .doc(rule.id)
        .set({ reassignedClientId: selectedUser ? selectedUser.alphacomId : null }, { merge: true })
        .then(_ => console.log('Saved'));
    },
    [rule],
  );

  const adminUser = useUserByAlphacomId(rule.agentId);
  const reassignToUser = useUserByAlphacomId(rule.reassignedClientId);

  return (
    <TableRow {...other}>
      {!adminUser ? (
        <ChartsCircularProgress />
      ) : (
        <>
          <TableCell padding="checkbox">
            <Checkbox
              checked={selected}
              onClick={event => onSelectRow(event)}
              onFocus={event => event.stopPropagation()}
              color="primary"
            />
          </TableCell>
          <TableCell component="th" scope="row">
            {adminUser.firstName} {adminUser.lastName}
          </TableCell>
          <TableCell align="right">{rule.carrier}</TableCell>
          <TableCell align="right">
            <UserInput
              label="Reassign To"
              users={assignableUsersWithoutCurrent || []}
              onChange={(_, user) => onReassignedClientChange(user)}
              value={reassignToUser}
            />
          </TableCell>
        </>
      )}
    </TableRow>
  );
};

interface Props {
  rule: ReassignmentRule;
  selected: boolean;
  onSelectRow: (event: React.MouseEvent<HTMLElement>) => void;
}

export default ReassignUserRow;
