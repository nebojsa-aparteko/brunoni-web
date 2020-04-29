import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import React, { useCallback, useContext, useState } from 'react';
import useAdminUsers from '../../hooks/useAdminUsers';
import TeamsUsersChipMultiInput from './TeamsUsersChipMultiInput';
import { Team } from '../../model/Teams';
import { Button, Checkbox, FormControl, Input, ListItemText, MenuItem, Select, TextField } from '@material-ui/core';
import set from 'lodash/fp/set';
import UserRecord from '../../model/UserRecord';
import { firestore } from 'firebase';
import asArray from '../../utilities/asArray';
import Carriers from '../../contexts/Carriers';
import firebase from '../../firebase';
import { BookingCategory } from '../../model/Booking';
import { ChecklistNames } from '../bookings/checklist/ChecklistItemModel';

interface Props {
  team: Team;
}
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const saveChanges = (field: string, value: any, teamId: string) => {
  return firebase
    .firestore()
    .collection('teams')
    .doc(teamId)
    .update(field, value);
};

const TeamTeamRow: React.FC<Props> = ({ team, ...other }) => {
  const adminUsers = useAdminUsers();

  const [activeTeam, setActiveTeam] = useState(team);
  const [changed, setChanged] = useState(false);
  const carriers = useContext(Carriers);
  const categories = Object.keys(BookingCategory);
  const checklistItems = Object.keys(ChecklistNames);
  const [selectedCarriers, setSelectedCarriers] = React.useState<string[]>(
    (team.carriers?.map(c => c.name) as string[]) || [],
  );
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>((team.categories as string[]) || []);
  const [selectedChecklists, setSelectedChecklists] = React.useState<string[]>((team.checklistItems as string[]) || []);
  const handleCarrierChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedCarriers(event.target.value as string[]);
    saveChanges(
      'carriers',
      carriers?.filter(c => (event.target.value as string[]).includes(c.name)).map(c => ({ id: c.id, name: c.name })),
      team.id as string,
    ).then(_ => console.log('Saved Carriers'));
  };
  const handleCategoryChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedCategories(event.target.value as string[]);
    saveChanges('categories', event.target.value as string[], team.id as string).then(_ =>
      console.log('Saved Carriers'),
    );
  };
  const handleChecklistItemChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedChecklists(event.target.value as string[]);
    saveChanges('checklistItems', event.target.value as string[], team.id as string).then(_ =>
      console.log('Saved Carriers'),
    );
  };
  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setActiveTeam(set('name', event.target.value)(activeTeam));
    setChanged(true);
  };

  const onTeamsChanged = (event: React.ChangeEvent<{}>, value: UserRecord[] | UserRecord | null) => {
    setActiveTeam(set('users', asArray(value))(activeTeam));
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
        <FormControl>
          <Select
            id="carriers-multiple-checkbox"
            multiple
            displayEmpty
            value={selectedCarriers}
            onChange={handleCarrierChange}
            input={<Input />}
            renderValue={_ => {
              return <em>Choose carriers</em>;
            }}
            MenuProps={MenuProps}
          >
            <MenuItem disabled value="">
              <em>Choose carriers</em>
            </MenuItem>
            {carriers?.map(carrier => (
              <MenuItem key={carrier.id} value={carrier.name}>
                <Checkbox checked={selectedCarriers.indexOf(carrier.name) > -1} />
                <ListItemText primary={carrier.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </TableCell>
      <TableCell align="right">
        <FormControl>
          <Select
            id="categories-multiple-checkbox"
            multiple
            displayEmpty
            value={team?.categories || []}
            onChange={handleCategoryChange}
            input={<Input />}
            renderValue={_ => <em>Choose categories</em>}
            MenuProps={MenuProps}
          >
            <MenuItem disabled value="">
              <em>Choose categories</em>
            </MenuItem>
            {categories?.map(category => (
              <MenuItem key={category} value={category}>
                <Checkbox checked={selectedCategories.indexOf(category) > -1} />
                <ListItemText primary={category} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </TableCell>

      <TableCell align="right">
        <FormControl>
          <Select
            id="checklist-item-multiple-checkbox"
            multiple
            displayEmpty
            value={team?.checklistItems || []}
            onChange={handleChecklistItemChange}
            input={<Input />}
            renderValue={_ => <em>Choose checklist items</em>}
            MenuProps={MenuProps}
          >
            <MenuItem disabled value="">
              <em>Choose checklist items</em>
            </MenuItem>
            {checklistItems?.map(checklistItem => (
              <MenuItem key={checklistItem} value={checklistItem}>
                <Checkbox checked={selectedChecklists.indexOf(checklistItem) > -1} />
                <ListItemText primary={checklistItem} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
