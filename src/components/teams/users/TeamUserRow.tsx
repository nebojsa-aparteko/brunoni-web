import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import React, { useCallback, useContext, useMemo } from 'react';
import invoke from 'lodash/fp/invoke';
import UserRecord, { ADMIN_ROLES, UserRecordMin, UserRecordMinProperties } from '../../../model/UserRecord';
import { formatDistanceToNowConfigured } from '../../../utilities/formattingHelpers';
import useAdminUsers from '../../../hooks/useAdminUsers';
import UserInput from '../../inputs/UserInput';
import firebase from '../../../firebase';
import { pick } from 'lodash/fp';
import UserNotificationRedirectionSwitch from '../../UserNotificationRedirectionSwitch';
import { Checkbox } from '@material-ui/core';
import Carriers from '../../../contexts/Carriers';
import CarriersMultiInput from '../../inputs/CarriersMultiInput';
import Carrier from '../../../model/Carrier';
import asArray from '../../../utilities/asArray';

const TeamUserRow: React.FC<Props> = ({ user, selected, onSelectRow, ...other }) => {
  const assignableUsers = useAdminUsers(ADMIN_ROLES);
  const carriers = useContext(Carriers);
  const selectedCarriers = useMemo(() => carriers?.filter(carrier => user.carriers?.includes(carrier.id)), [
    user.carriers,
    carriers,
  ]);

  const assignableUsersWithoutCurrent = useMemo(
    () => assignableUsers.filter(assignableUser => assignableUser.alphacomId !== user.alphacomId),
    [assignableUsers, user],
  );
  // const userCarrier = useMemo(() => {
  //   return user.carrier ? carriers?.find(carrier => carrier.id === user.carrier) : undefined;
  // }, [user.carrier, carriers]);

  const handleChangeRedirectedAdmin = useCallback(
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

  const handleChangeCarriers = (event: React.ChangeEvent<{}>, value: Carrier | Carrier[] | null) => {
    const carrierIds = asArray(value).map(carrier => carrier.id);
    firebase
      .firestore()
      .collection('users')
      .doc(user.id)
      .set({ carriers: carrierIds && carrierIds.length > 0 ? carrierIds : null }, { merge: true })
      .then(_ => console.log('Saved'));
  };

  return (
    <TableRow {...other}>
      <TableCell padding="checkbox">
        <Checkbox
          checked={selected}
          onClick={event => onSelectRow(event)}
          onFocus={event => event.stopPropagation()}
          color="primary"
        />
      </TableCell>
      <TableCell component="th" scope="row">
        {user.firstName} {user.lastName}
      </TableCell>
      <TableCell align="right">{user.emailAddress}</TableCell>
      <TableCell align="right">{user.role}</TableCell>
      <TableCell align="right">
        <CarriersMultiInput value={selectedCarriers} onChange={handleChangeCarriers} />
      </TableCell>
      <TableCell align="right">
        {user.lastSession ? formatDistanceToNowConfigured(invoke('toDate')(user.lastSession)) : 'never'}
      </TableCell>
      <TableCell align="right">
        <UserNotificationRedirectionSwitch userUid={user.id || ''} user={user} />
      </TableCell>
      <TableCell align="right">
        <UserInput
          label=""
          users={assignableUsersWithoutCurrent || []}
          onChange={(_, user) => handleChangeRedirectedAdmin(user)}
          value={user.redirectedAdmin}
        />
      </TableCell>
    </TableRow>
  );
};

interface Props {
  user: UserRecord;
  selected: boolean;
  onSelectRow: (event: React.MouseEvent<HTMLElement>) => void;
}

export default TeamUserRow;
