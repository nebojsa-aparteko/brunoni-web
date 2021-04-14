import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Typography } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import TeamsPaymentConfirmationTable from './TeamsPaymentConfirmationTable';

const useStyles = makeStyles({
  expansionPanel: {
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

const TeamsPaymentConfirmationContainer: React.FC = () => {
  const classes = useStyles();

  return (
    <Box flex={1} display="flex" flexDirection="column" m={1}>
      <ExpansionPanel defaultExpanded={true} className={classes.expansionPanel}>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} className={classes.expansionPanelSummary}>
          <Typography variant="h5" className={classes.expansionPanelTitle}>
            Payment confirmation 1
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <TeamsPaymentConfirmationTable />
        </ExpansionPanelDetails>
      </ExpansionPanel>
      <ExpansionPanel className={classes.expansionPanel}>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />} className={classes.expansionPanelSummary}>
          <Typography variant="h5" className={classes.expansionPanelTitle}>
            Payment confirmation 2
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>todo</ExpansionPanelDetails>
      </ExpansionPanel>
    </Box>
  );
};

export default TeamsPaymentConfirmationContainer;
