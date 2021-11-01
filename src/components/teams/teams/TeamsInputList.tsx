import React from 'react';
import { GroupType, Team, TeamType } from '../../../model/Teams';
import { Box, TextField, Theme } from '@material-ui/core';
import TeamsUsersChipMultiInput from '../../inputs/TeamsUsersChipMultiInput';
import UserRecord from '../../../model/UserRecord';
import CarriersMultiInput from '../../inputs/CarriersMultiInput';
import Carrier from '../../../model/Carrier';
import MultipleCategoryInput from '../../inputs/MultipleCategoryInput';
import { BookingCategory } from '../../../model/Booking';
import MultipleChecklistInput from '../../inputs/MultipleChecklistInput';
import MultipleTaskTypeInput from '../../inputs/MultipleTaskTypeInput';
import { TaskType } from '../../../model/Task';
import { makeStyles } from '@material-ui/core/styles';
import theme from '../../../theme';
import { useTeamsContext } from '../../../providers/TeamsContextProvider';

const useStyles = makeStyles((theme: Theme) => ({
  inputContainer: {
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    '& > *': {
      width: '600px',
      paddingBottom: theme.spacing(2),
    },
  },
}));

interface Props {
  teamState: Team | undefined;
  setTeamState: React.Dispatch<React.SetStateAction<Team | undefined>>;
}

const TeamsInputList: React.FC<Props> = ({ teamState, setTeamState }) => {
  const classes = useStyles();

  const {
    teamContextState: { teamType, groupType },
  } = useTeamsContext();

  const renderSwitch = (groupType: GroupType) => {
    switch (groupType) {
      case GroupType.BOOKINGS:
        return (
          <>
            <CarriersMultiInput
              value={teamState?.carriers}
              onChange={(_, value) => setTeamState(prev => ({ ...prev, carriers: value as Carrier[] }))}
            />
            <MultipleCategoryInput
              value={teamState?.categories}
              onChange={(_, value) => setTeamState(prev => ({ ...prev, categories: value as BookingCategory[] }))}
            />
            {teamType === TeamType.OPERATIONS ? (
              <MultipleChecklistInput
                value={teamState?.checklistItems}
                onChange={(_, value) => setTeamState(prev => ({ ...prev, checklistItems: value as string[] }))}
              />
            ) : (
              <MultipleTaskTypeInput
                value={teamState?.taskTypes}
                onChange={(_, value) => setTeamState(prev => ({ ...prev, taskTypes: value as TaskType[] }))}
              />
            )}
          </>
        );
      case GroupType.BOOKING_REQUESTS:
        return (
          <>
            <CarriersMultiInput
              value={teamState?.carriers}
              onChange={(_, value) => setTeamState(prev => ({ ...prev, carriers: value as Carrier[] }))}
            />
          </>
        );
      case GroupType.QUOTES:
        return (
          <>
            <CarriersMultiInput
              value={teamState?.carriers}
              onChange={(_, value) => setTeamState(prev => ({ ...prev, carriers: value as Carrier[] }))}
            />
          </>
        );
      case GroupType.VESSEL:
        return (
          <>
            <CarriersMultiInput
              value={teamState?.carriers}
              onChange={(_, value) => setTeamState(prev => ({ ...prev, carriers: value as Carrier[] }))}
            />
          </>
        );
      case GroupType.LAND_TRANSPORT:
        return <></>;
    }
  };

  return (
    <Box className={classes.inputContainer} flexDirection="column" justifyContent="center" p={4}>
      <TextField
        fullWidth={true}
        variant="outlined"
        style={{ marginRight: theme.spacing(1) }}
        defaultValue={teamState?.name}
        label="Team name"
        onChange={({ target: { value } }) => setTeamState(prev => ({ ...prev, name: value }))}
      />
      <TeamsUsersChipMultiInput
        value={teamState?.users}
        onChange={(_, value) => setTeamState(prev => ({ ...prev, users: value as UserRecord[] }))}
      />
      {renderSwitch(groupType)}
    </Box>
  );
};

export default TeamsInputList;
