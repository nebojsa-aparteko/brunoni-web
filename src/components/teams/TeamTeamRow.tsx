import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import React, { useCallback, useState } from 'react';
import useAdminUsers from '../../hooks/useAdminUsers';
import TeamsUsersChipMultiInput from './TeamsUsersChipMultiInput';
import { Team } from '../../model/Teams';
import { Button, TextField } from '@material-ui/core';
import set from 'lodash/fp/set';
import UserRecord from '../../model/UserRecord';
import { AutocompleteChangeDetails, AutocompleteChangeReason } from '@material-ui/lab/useAutocomplete/useAutocomplete';
import { firestore } from 'firebase';
import { act } from 'react-dom/test-utils';
import asArray from '../../utilities/asArray';
import useTeams from '../../hooks/useTeams';

interface Props {
  team: Team;
}

const TeamTeamRow: React.FC<Props> = ({ team, ...other }) => {
  const adminUsers = useAdminUsers();

  const [activeTeam, setActiveTeam] = useState(team);
  const [changed, setChanged] = useState(false);

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setActiveTeam(set('name', event.target.value)(activeTeam));
    setChanged(true);
  };

  const onTeamsChanged = (event: React.ChangeEvent<{}>, value: UserRecord[] | UserRecord | null) => {
    setActiveTeam(set('teams', asArray(value))(activeTeam));
    setChanged(true);
  };

  const onSave = useCallback(() => {
    const teamsCollection = firestore().collection('teams');
    if (activeTeam.id) {
      teamsCollection.doc(activeTeam.id).update(activeTeam);
    } else {
      teamsCollection.add(activeTeam);
    }
  }, [activeTeam]);

  return (
    <TableRow {...other}>
      <TableCell component="th" scope="row">
        <TextField defaultValue={team.name} placeholder="Team name" onChange={onNameChange} />
      </TableCell>
      <TableCell align="right">
        <TeamsUsersChipMultiInput options={adminUsers || []} values={team.users || []} onChange={onTeamsChanged} />
      </TableCell>
      <TableCell align="right">
        {changed && (
          <Button onClick={onSave} size="small" color="primary" variant="contained">
            Save
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};

export default TeamTeamRow;
