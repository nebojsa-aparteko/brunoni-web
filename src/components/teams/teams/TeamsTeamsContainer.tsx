import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Typography } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { GroupType, TeamType } from '../../../model/Teams';
import firebase from '../../../firebase';
import TeamsContainer from './TeamsContainer';
import Paper from '@material-ui/core/Paper';
import TeamsContextProvider from '../../../providers/TeamsContextProvider';

const useStyles = makeStyles({
  expansionPanel: {
    padding: 0,
    marginBottom: 8,
  },
  expansionPanelSummary: {
    display: 'flex',
  },
  expansionPanelTitle: {
    alignSelf: 'center',
    marginRight: 16,
  },
});

export const deleteTeam = async (teamId: string) =>
  await firebase
    .firestore()
    .collection('teams')
    .doc(teamId)
    .delete();

export const deleteTeams = async (teamIds: string[]): Promise<any> => {
  const requests = teamIds.map(async (teamId: string) => {
    return await deleteTeam(teamId);
  });

  return Promise.all(requests);
};

const TeamsTeamsContainer: React.FC = () => {
  const classes = useStyles();

  return (
    <Box flex={1} display="flex" flexDirection="column" m={1}>
      <ExpansionPanel className={classes.expansionPanel} TransitionProps={{ mountOnEnter: true }}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          className={classes.expansionPanelSummary}
          component={Paper}
        >
          <Typography variant="h5" className={classes.expansionPanelTitle}>
            Accounting teams
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.expansionPanel}>
          <TeamsContextProvider
            initialState={{
              teamType: TeamType.ACCOUNTING,
              groupType: GroupType.BOOKINGS, //first tab
            }}
          >
            <TeamsContainer />
          </TeamsContextProvider>
        </ExpansionPanelDetails>
      </ExpansionPanel>
      <ExpansionPanel className={classes.expansionPanel} TransitionProps={{ mountOnEnter: true }}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          className={classes.expansionPanelSummary}
          component={Paper}
        >
          <Typography variant="h5" className={classes.expansionPanelTitle}>
            Operations teams
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.expansionPanel}>
          <TeamsContextProvider
            initialState={{
              teamType: TeamType.OPERATIONS,
              groupType: GroupType.BOOKINGS, //second tab
            }}
          >
            <TeamsContainer />
          </TeamsContextProvider>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </Box>
  );
};

export default TeamsTeamsContainer;
