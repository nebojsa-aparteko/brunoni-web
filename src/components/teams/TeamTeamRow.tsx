import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import React, { useCallback, useContext, useState } from 'react';
import useAdminUsers from '../../hooks/useAdminUsers';
import TeamsUsersChipMultiInput from './TeamsUsersChipMultiInput';
import { Team, TeamType } from '../../model/Teams';
import { Button, Checkbox, TextField, Typography } from '@material-ui/core';
import set from 'lodash/fp/set';
import UserRecord, { UserRecordMinProperties } from '../../model/UserRecord';
import asArray from '../../utilities/asArray';
import Carriers from '../../contexts/Carriers';
import firebase from '../../firebase';
import { BookingCategory } from '../../model/Booking';
import { ChecklistNames, ChecklistNamesPreview } from '../bookings/checklist/ChecklistItemModel';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Chip from '@material-ui/core/Chip';
import Carrier from '../../model/Carrier';
import { useSnackbar } from 'notistack';
import pick from 'lodash/fp/pick';
import { TaskDescription, TaskType } from '../../model/Task';
import CarriersMultiInput from '../inputs/CarriersMultiInput';

interface Props extends React.Attributes {
  team: Team;
  selected: boolean;
  onSelectRow: (event: React.MouseEvent<HTMLElement>) => void;
}

const categories = Object.keys(BookingCategory);
const checklistItems = Object.entries(ChecklistNamesPreview).map(t => t[1]);
const checklistNamesPreview = Object.entries(ChecklistNamesPreview);
const taskTypes = Object.entries(TaskDescription).map(t => t[1]);
const taskTypeNamesPreview = Object.entries(TaskDescription);

const TeamTeamRow: React.FC<Props> = ({ team, selected, onSelectRow, key, ...other }) => {
  const adminUsers = useAdminUsers();

  const [activeTeam, setActiveTeam] = useState(team);

  const [changed, setChanged] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const carriers = useContext(Carriers);

  const handleCarrierChange = (event: React.ChangeEvent<{}>, value: Carrier | Carrier[] | null) => {
    setActiveTeam(set('carriers', asArray(value))(activeTeam));
    setChanged(true);
  };
  const handleCategoryChange = (event: React.ChangeEvent<{}>, value: string | string[] | null) => {
    setActiveTeam(set('categories', asArray(value))(activeTeam));
    setChanged(true);
  };
  const handleChecklistItemChange = (event: React.ChangeEvent<{}>, value: string | string[] | null) => {
    const checklistNamesPreview = Object.entries(ChecklistNamesPreview);

    setActiveTeam(
      set(
        'checklistItems',
        asArray(value)
          .map(val => checklistNamesPreview.find(([, name]) => name === val)?.[0])
          .map(val => ChecklistNames[val as keyof typeof ChecklistNames]),
      )(activeTeam),
    );
    setChanged(true);
  };
  const handleTaskTypeChange = (event: React.ChangeEvent<{}>, value: string | string[] | null) => {
    setActiveTeam(
      set(
        'taskTypes',
        asArray(value)
          .map(val => taskTypeNamesPreview.find(([, name]) => name === val)?.[0])
          .map(val => TaskType[val as keyof typeof TaskType]),
      )(activeTeam),
    );
    setChanged(true);
  };
  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setActiveTeam(set('name', event.target.value)(activeTeam));
    setChanged(true);
  };

  const onTeamsChanged = (event: React.ChangeEvent<{}>, value: UserRecord[] | UserRecord | null) => {
    setActiveTeam(
      set(
        'users',
        asArray(value).map(item => pick(UserRecordMinProperties)(item)),
      )(activeTeam),
    );
    setChanged(true);
  };

  const onSave = useCallback(() => {
    const teamsCollection = firebase.firestore().collection('teams');

    teamsCollection
      .doc(activeTeam.id)
      .update(activeTeam)
      .then(_ => {
        setChanged(false);
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
  }, [activeTeam, enqueueSnackbar]);

  return (
    <TableRow key={key} {...other}>
      <TableCell padding="checkbox">
        <Checkbox
          checked={selected}
          onClick={event => onSelectRow(event)}
          onFocus={event => event.stopPropagation()}
          color="primary"
        />
      </TableCell>
      <TableCell component="th" scope="row" style={{ minWidth: '150px' }}>
        <TextField defaultValue={team?.name} placeholder="Team name" onChange={onNameChange} />
      </TableCell>
      <TableCell align="right">
        <TeamsUsersChipMultiInput options={adminUsers || []} values={team.users || []} onChange={onTeamsChanged} />
      </TableCell>
      <TableCell align="right">
        <CarriersMultiInput options={carriers || []} defaultValues={team.carriers} onChange={handleCarrierChange} />
        {/*<Autocomplete*/}
        {/*  multiple*/}
        {/*  autoHighlight*/}
        {/*  options={carriers || []}*/}
        {/*  getOptionSelected={(option, value) => option.name === value.name}*/}
        {/*  getOptionLabel={option => option.name}*/}
        {/*  defaultValue={team.carriers}*/}
        {/*  onChange={handleCarrierChange}*/}
        {/*  renderTags={(value, getTagProps) =>*/}
        {/*    value.map((option, index) => <Chip label={option.name} {...getTagProps({ index })} />)*/}
        {/*  }*/}
        {/*  renderInput={params => (*/}
        {/*    <TextField {...params} label="Carriers" placeholder="Type to filter" variant="outlined" />*/}
        {/*  )}*/}
        {/*/>*/}
      </TableCell>
      <TableCell align="right">
        <Autocomplete
          multiple
          autoHighlight
          options={categories || []}
          getOptionSelected={(option, value) => option === value}
          defaultValue={team.categories}
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
        {team.teamType === TeamType.OPERATIONS ? (
          <Autocomplete
            multiple
            autoHighlight
            options={checklistItems || []}
            defaultValue={team.checklistItems
              ?.map(value => Object.entries(ChecklistNames).find(([, name]) => value === name)?.[0] || '')
              ?.map(val => checklistNamesPreview.find(([id]) => id === val)?.[1] || '')}
            getOptionSelected={(option, value) => option === value}
            onChange={handleChecklistItemChange}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => <Chip label={option} {...getTagProps({ index })} />)
            }
            renderInput={params => (
              <TextField {...params} label="Checklist" placeholder="Type to filter" variant="outlined" />
            )}
          />
        ) : (
          <Autocomplete
            multiple
            autoHighlight
            options={taskTypes || []}
            defaultValue={team.taskTypes
              ?.map(value => Object.entries(TaskType).find(([, name]) => value === name)?.[0] || '')
              ?.map(val => taskTypeNamesPreview.find(([id]) => id === val)?.[1] || '')}
            getOptionSelected={(option, value) => option === value}
            onChange={handleTaskTypeChange}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => <Chip label={option} {...getTagProps({ index })} />)
            }
            renderInput={params => (
              <TextField {...params} label="Task type" placeholder="Type to filter" variant="outlined" />
            )}
          />
        )}
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
