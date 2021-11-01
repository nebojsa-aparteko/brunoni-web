import React from 'react';
import { Avatar, Box, Checkbox, Chip, TableCell, TableRow, Typography } from '@material-ui/core';
import { Team } from '../../../model/Teams';
import { tabStyles } from '../../../pages/TeamManagementPage';
import TeamsRowDrawer from './TeamsRowDrawer';
import { AvatarGroup } from '@material-ui/lab';
import theme from '../../../theme';
import { TaskDescription, TaskType } from '../../../model/Task';
import InfoBoxItem from '../../InfoBoxItem';
import { ChecklistNames, ChecklistNamesPreview } from '../../bookings/checklist/ChecklistItemModel';

interface Props {
  team: Team;
  selected: boolean;
  onSelectRow: (event: React.MouseEvent<HTMLElement>) => void;
}

const TeamRow: React.FC<Props> = ({ team, selected, onSelectRow }) => {
  const classes = tabStyles();
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <TableRow className={classes.row} onClick={handleOpen}>
      <TableCell padding="checkbox">
        <Checkbox
          checked={selected}
          onClick={event => onSelectRow(event)}
          onFocus={event => event.stopPropagation()}
          color="primary"
        />
      </TableCell>
      <TableCell>
        <Box display={'flex'} flexDirection={'column'}>
          {team?.name && <InfoBoxItem title="Team name" label1={team.name} gutterBottom />}
          {team.users && team.users.length > 0 && (
            <InfoBoxItem
              title="Members"
              label1={
                <AvatarGroup className={classes.avatarGroup} classes={{ avatar: classes.lastAvatar }}>
                  {team.users.map((user, index) => (
                    <Avatar
                      key={index}
                      style={{ backgroundColor: theme.palette.secondary.main }}
                      alt={`${user.firstName} ${user.lastName}`}
                      src={'todo.jpeg'} //todo. Add image
                    >{`${user.firstName[0]}${user.lastName[0]}`}</Avatar>
                  ))}
                </AvatarGroup>
              }
              gutterBottom
            />
          )}
        </Box>
      </TableCell>
      <TableCell>
        <Box display={'flex'} flexDirection={'column'}>
          {team.carriers && team.carriers.length > 0 && (
            <InfoBoxItem
              title="Carriers"
              label1={
                <Box display={'flex'} alignItems={'center'} flexWrap={'wrap'}>
                  {team.carriers.map((carrier, index) => (
                    <Chip key={index} label={carrier.id} variant="outlined" />
                    // <Typography key={index} style={{ marginRight: index < team.carriers!.length - 1 ? '4px' : '' }}>
                    //   {`${carrier.name}${index < team.carriers!.length - 1 ? ',' : ''}`}
                    // </Typography>
                  ))}
                </Box>
              }
              gutterBottom
            />
          )}
          {team.categories && team.categories.length > 0 && (
            <InfoBoxItem
              title="Categories"
              label1={
                <Box display={'flex'} alignItems={'center'} flexWrap={'wrap'}>
                  {team.categories.map((category, index) => (
                    <Chip key={index} label={category} variant="outlined" />
                    // <Typography key={index} style={{ marginRight: index < team.categories!.length - 1 ? '4px' : '' }}>
                    //   {`${category}${index < team.categories!.length - 1 ? ',' : ''}`}
                    // </Typography>
                  ))}
                </Box>
              }
              gutterBottom
            />
          )}
        </Box>
      </TableCell>
      <TableCell>
        <Box display={'flex'} flexDirection={'column'}>
          {team.taskTypes && team.taskTypes.length > 0 && (
            <InfoBoxItem title="Tasks" label1={<TasksTypesList taskTypes={team.taskTypes} limit={3} />} gutterBottom />
          )}
          {team?.checklistItems && team.checklistItems.length > 0 && (
            <InfoBoxItem
              title="Checklists"
              label1={<ChecklistItemsList checklistItems={team.checklistItems} limit={3} />}
              gutterBottom
            />
          )}
        </Box>
      </TableCell>
      <TableCell></TableCell>
      {/*Hack around 'div under tr' warning*/}
      <TableCell style={{ display: 'none' }}>
        <TeamsRowDrawer open={open} setOpen={setOpen} team={team} />
      </TableCell>
    </TableRow>
  );
};

export default TeamRow;

const TasksTypesList: React.FC<{ taskTypes: TaskType[]; limit?: number }> = ({ taskTypes, limit = 4 }) => {
  return (
    <Box display={'flex'} alignItems={'center'} flexWrap={'wrap'}>
      {taskTypes
        .map(value => Object.entries(TaskType).find(([, name]) => value === name)?.[0] || '')
        .map(val => Object.entries(TaskDescription).find(([id]) => id === val)?.[1] || '')
        .map((taskType, index) => {
          if (index < limit) {
            return <Chip key={index} label={taskType} variant="outlined" />;
          } else if (index === limit) {
            return <Chip key={index} label={`+${taskTypes.length - limit}`} variant="outlined" />;
          } else {
            return null;
          }
        })}
    </Box>
  );
};

const ChecklistItemsList: React.FC<{ checklistItems: string[]; limit?: number }> = ({ checklistItems, limit = 4 }) => {
  return (
    <Box display={'flex'} alignItems={'center'} flexWrap={'wrap'}>
      {checklistItems
        .map(value => Object.entries(ChecklistNames).find(([, name]) => value === name)?.[0] || '')
        .map(val => Object.entries(ChecklistNamesPreview).find(([id]) => id === val)?.[1] || '')
        .map((checklist, index) => {
          if (index < limit) {
            return <Chip key={index} label={checklist} variant="outlined" />;
          } else if (index === limit) {
            return <Chip key={index} label={`+${checklistItems.length - limit}`} variant="outlined" />;
          } else {
            return null;
          }
        })}
    </Box>
  );
};
