import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import React, { useCallback, useState } from 'react';
import { Team } from '../../model/Teams';
import invoke from 'lodash/fp/invoke';
import set from 'lodash/fp/set';
import UserRecord from '../../model/UserRecord';
import { firestore } from 'firebase';
import asArray from '../../utilities/asArray';
import useTeams from '../../hooks/useTeams';
import TeamsTeamsChipMultiInput from './TeamsTeamsChipMultiInput';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  user: UserRecord;
}

const TeamUserRow: React.FC<Props> = ({ user, ...other }) => {
  const teams = useTeams();

  const [activeUser, setActiveUser] = useState(user);
  const [changed, setChanged] = useState(false);

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setActiveUser(set('name', event.target.value)(activeUser));
    setChanged(true);
  };

  const onTeamsChanged = (event: React.ChangeEvent<{}>, value: Team[] | Team | null) => {
    setActiveUser(set('teams', asArray(value))(activeUser));
    setChanged(true);
  };

  const onSave = useCallback(() => {
    const teamsCollection = firestore().collection('users');
    if (activeUser.alphacomId) {
      teamsCollection.doc(activeUser.alphacomId).update(activeUser);
    } else {
      teamsCollection.add(activeUser);
    }
  }, [activeUser]);

  return (
    <TableRow {...other}>
      <TableCell component="th" scope="row">
        {user.firstName} {user.lastName}
      </TableCell>
      <TableCell align="right">{user.emailAddress}</TableCell>
      <TableCell align="right">{user.role}</TableCell>
      <TableCell align="right">
        <TeamsTeamsChipMultiInput options={teams || []} values={user.teams || []} onChange={onTeamsChanged} />
      </TableCell>
      <TableCell align="right">
        {user.lastSession ? formatDistanceToNow(invoke('toDate')(user.lastSession)) : 'never'}
      </TableCell>
    </TableRow>
  );
};

export default TeamUserRow;
