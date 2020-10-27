import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import useTeams from '../../hooks/useTeams';
import {
  Box,
  Button,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Typography,
} from '@material-ui/core';
import { firestore } from 'firebase';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import OperationsTeamsTable from './OperationsTeamsTable';
import AccountingTeamsTable from './AccountingTeamsTable';
import { TeamType } from '../../model/Teams';

const useStyles = makeStyles({
  expansionPanel: {
    marginBottom: 8,
  },
  closeModal: {
    position: 'absolute',
    top: '5px',
    right: '12px',
    width: '47px',
    height: '47px',
  },
  dialogActions: {
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  expansionPanelSummary: {
    display: 'flex',
  },
  expansionPanelTitle: {
    alignSelf: 'center',
    marginRight: 16,
  },
});

const TeamsTeamsContainer: React.FC = () => {
  const classes = useStyles();
  const teams = useTeams();

  const onAdd = (isAccounting: boolean, event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    firestore()
      .collection('teams')
      .add({ name: '', teamType: isAccounting ? TeamType.ACCOUNTING : TeamType.OPERATIONS })
      .then(docRef => {
        console.log('Added doc ref ', docRef.id);
      })
      .catch(err => console.error('Failed to add new item ', err));
  };

  return (
    <div style={{ overflowY: 'hidden' }}>
      {!teams ? (
        <ChartsCircularProgress />
      ) : (
        <div>
          <Box flex={1} display="flex" flexDirection="column" m={1}>
            <ExpansionPanel className={classes.expansionPanel}>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} className={classes.expansionPanelSummary}>
                <Typography variant="h5" className={classes.expansionPanelTitle}>
                  Accounting teams
                </Typography>
                <Button onClick={event => onAdd(true, event)} color="primary" variant="outlined" size="small">
                  Create New Accounting Team
                </Button>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <AccountingTeamsTable teams={teams.filter(team => team.teamType === TeamType.ACCOUNTING)} />
              </ExpansionPanelDetails>
            </ExpansionPanel>
            <ExpansionPanel defaultExpanded={true} className={classes.expansionPanel}>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} className={classes.expansionPanelSummary}>
                <Typography variant="h5" className={classes.expansionPanelTitle}>
                  Operations teams
                </Typography>
                <Button onClick={event => onAdd(false, event)} color="primary" variant="outlined" size="small">
                  Create New Operations team
                </Button>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <OperationsTeamsTable teams={teams.filter(team => team.teamType === TeamType.OPERATIONS)} />
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </Box>
        </div>
      )}
    </div>
  );
};

export default TeamsTeamsContainer;
