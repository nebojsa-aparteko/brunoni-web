import React, { useCallback, useState } from 'react';
import { Box, Button, IconButton, Typography } from '@material-ui/core';
import { Team } from '../../../model/Teams';
import CloseIcon from '@material-ui/icons/Close';
import theme from '../../../theme';
import firebase from 'firebase/app';
import { useSnackbar } from 'notistack';
import { useTeamsContext } from '../../../providers/TeamsContextProvider';
import TeamsInputList from './TeamsInputList';

const TeamsRowForm: React.FC<Props> = ({ team, handleClose }) => {
  const [teamState, setTeamState] = useState<Team | undefined>(team);
  const { enqueueSnackbar } = useSnackbar();

  const {
    teamContextState: { teamType, groupType },
  } = useTeamsContext();

  const onSave = useCallback(async () => {
    const teamsCollection = firebase.firestore().collection('teams');
    // Update
    if (team && teamState) {
      try {
        const updatedAt = new Date();
        await teamsCollection.doc(team.id).update({
          ...teamState,
          updatedAt,
        });
      } catch (error) {
        console.error(error);
        enqueueSnackbar(<Typography color="inherit"> Failed to update team</Typography>, {
          variant: 'error',
          autoHideDuration: 3000,
        });
      } finally {
        enqueueSnackbar(<Typography color="inherit">Team updated</Typography>, {
          variant: 'success',
          autoHideDuration: 3000,
        });
        handleClose();
      }
      // Creation
    } else if (teamState && !team) {
      try {
        const id = teamsCollection.doc().id;
        const createdAt = new Date();
        const updatedAt = createdAt;
        await teamsCollection.doc(id).set({
          ...teamState,
          id,
          teamType,
          groupType,
          createdAt,
          updatedAt,
        } as Team);
      } catch (error) {
        console.error(error);
        enqueueSnackbar(<Typography color="inherit"> Failed to create team</Typography>, {
          variant: 'error',
          autoHideDuration: 3000,
        });
      } finally {
        enqueueSnackbar(<Typography color="inherit">Team created</Typography>, {
          variant: 'success',
          autoHideDuration: 3000,
        });
        handleClose();
      }
    }
  }, [enqueueSnackbar, groupType, handleClose, team, teamState, teamType]);

  return (
    <>
      <Box
        px={4}
        py={1}
        mb={2}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        borderBottom={1}
        borderColor="grey.300"
      >
        <Typography style={{ marginRight: theme.spacing(1) }} variant="h4">
          {teamState?.name ? `Team ${teamState.name}` : 'Create new team'}
        </Typography>
        <IconButton
          aria-label="close-button-notification-center"
          onClick={(event: React.MouseEvent<HTMLElement>) => {
            event.stopPropagation();
            handleClose();
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <TeamsInputList teamState={teamState} setTeamState={setTeamState} />
      <Button color="primary" variant="contained" onClick={onSave} style={{ margin: theme.spacing(2) }}>
        {teamState ? 'Edit team' : 'Add team'}
      </Button>
    </>
  );
};

interface Props {
  team?: Team;
  handleClose: () => void;
}

export default TeamsRowForm;
