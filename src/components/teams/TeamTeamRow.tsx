import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import React, { useCallback, useContext, useState } from 'react';
import useAdminUsers from '../../hooks/useAdminUsers';
import TeamsUsersChipMultiInput from './TeamsUsersChipMultiInput';
import { Team } from '../../model/Teams';
import { Button, TextField, Typography } from '@material-ui/core';
import set from 'lodash/fp/set';
import UserRecord from '../../model/UserRecord';
import { firestore } from 'firebase';
import asArray from '../../utilities/asArray';
import Carriers from '../../contexts/Carriers';
import firebase from '../../firebase';
import { BookingCategory } from '../../model/Booking';
import { ChecklistNames } from '../bookings/checklist/ChecklistItemModel';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Chip from '@material-ui/core/Chip';
import Carrier from '../../model/Carrier';
import { useSnackbar } from 'notistack';

interface Props extends React.Attributes {
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

const TeamTeamRow: React.FC<Props> = ({ team, key, ...other }) => {
  const adminUsers = useAdminUsers();

  const [activeTeam, setActiveTeam] = useState(team);

  const [changed, setChanged] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const carriers = useContext(Carriers);
  const categories = Object.keys(BookingCategory);
  const checklistItems = Object.keys(ChecklistNames);

  const handleCarrierChange = (event: React.ChangeEvent<{}>, value: Carrier | Carrier[] | null) => {
    setActiveTeam(set('carriers', asArray(value))(activeTeam));
    setChanged(true);
  };
  const handleCategoryChange = (event: React.ChangeEvent<{}>, value: string | string[] | null) => {
    setActiveTeam(set('categories', asArray(value))(activeTeam));
    setChanged(true);
  };
  const handleChecklistItemChange = (event: React.ChangeEvent<{}>, value: string | string[] | null) => {
    setActiveTeam(set('checklistItems', asArray(value))(activeTeam));
    setChanged(true);
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

    teamsCollection
      .doc(activeTeam.id)
      .update(activeTeam)
      .then(_ => {
        enqueueSnackbar(<Typography color="inherit">Saved changes!</Typography>, {
          variant: 'success',
          autoHideDuration: 1000,
        });
      })
      .catch(error => {
        console.trace(error);
        enqueueSnackbar(<Typography color="inherit"> {error.message}!</Typography>, {
          variant: 'error',
          autoHideDuration: 3000,
        });
      });
  }, [activeTeam]);

  return (
    <TableRow key={key} {...other}>
      <TableCell component="th" scope="row">
        <TextField defaultValue={team?.name} placeholder="Team name" onChange={onNameChange} />
      </TableCell>
      <TableCell align="right">
        <TeamsUsersChipMultiInput
          options={adminUsers || []}
          values={activeTeam.users || []}
          onChange={onTeamsChanged}
        />
      </TableCell>
      <TableCell align="right">
        <Autocomplete
          multiple
          options={carriers || []}
          getOptionLabel={option => option.name}
          defaultValue={activeTeam.carriers}
          onChange={handleCarrierChange}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => <Chip label={option.name} {...getTagProps({ index })} />)
          }
          renderInput={params => (
            <TextField {...params} label="Carriers" placeholder="Type to filter" variant="outlined" />
          )}
        />
      </TableCell>
      <TableCell align="right">
        <Autocomplete
          multiple
          options={categories || []}
          defaultValue={activeTeam.categories}
          onChange={handleCategoryChange}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => <Chip label={option} {...getTagProps({ index })} />)
          }
          renderInput={params => (
            <TextField {...params} label="Categories" placeholder="Type to filter" variant="outlined" />
          )}
        />
      </TableCell>

      <TableCell align="right">
        <Autocomplete
          multiple
          options={checklistItems || []}
          defaultValue={activeTeam.checklistItems}
          onChange={handleChecklistItemChange}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => <Chip label={option} {...getTagProps({ index })} />)
          }
          renderInput={params => (
            <TextField {...params} label="Checklist" placeholder="Type to filter" variant="outlined" />
          )}
        />
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
