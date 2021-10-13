import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Typography } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { TeamType } from '../../model/Teams';
import firebase from '../../firebase';
import TeamsContainer from './redesign/TeamsContainer';

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

export const deleteTeam = (teamId: string) =>
  firebase
    .firestore()
    .collection('teams')
    .doc(teamId)
    .delete();

export const deleteTeams = async (teamIds: string[]): Promise<any> => {
  const requests = teamIds.map((teamId: string) => {
    return deleteTeam(teamId);
  });

  return Promise.all(requests);
};

const TeamsTeamsContainer: React.FC = () => {
  const classes = useStyles();

  const onAdd = (isAccounting: boolean) => {
    firebase
      .firestore()
      .collection('teams')
      .add({ name: '', teamType: isAccounting ? TeamType.ACCOUNTING : TeamType.OPERATIONS })
      .then(docRef => {
        console.log('Added doc ref ', docRef.id);
      })
      .catch(err => console.error('Failed to add new item ', err));
  };

  return (
    <Box flex={1} display="flex" flexDirection="column" m={1}>
      <ExpansionPanel className={classes.expansionPanel} TransitionProps={{ mountOnEnter: true }}>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} className={classes.expansionPanelSummary}>
          <Typography variant="h5" className={classes.expansionPanelTitle}>
            Accounting teams
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.expansionPanel}>
          <TeamsContainer type={TeamType.ACCOUNTING} />
        </ExpansionPanelDetails>
      </ExpansionPanel>
      <ExpansionPanel className={classes.expansionPanel} TransitionProps={{ mountOnEnter: true }}>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} className={classes.expansionPanelSummary}>
          <Typography variant="h5" className={classes.expansionPanelTitle}>
            Operations teams
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.expansionPanel}>
          <TeamsContainer type={TeamType.OPERATIONS} />
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </Box>
  );
};

export default TeamsTeamsContainer;
