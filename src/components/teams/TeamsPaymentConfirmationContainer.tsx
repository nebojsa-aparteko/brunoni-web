import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Box,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Typography,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import TeamsPaymentConfirmationCarrierSettingsTable from './TeamsPaymentConfirmationCarrierSettingsTable';
import TeamsPaymentConfirmationCustomerSettingsTable from './TeamsPaymentConfirmationCustomerSettingsTable';

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
      <ExpansionPanel className={classes.expansionPanel} TransitionProps={{ mountOnEnter: true }}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          className={classes.expansionPanelSummary}
        >
          <Typography variant="h5" className={classes.expansionPanelTitle}>
            Carrier Settings
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <TeamsPaymentConfirmationCarrierSettingsTable />
        </ExpansionPanelDetails>
      </ExpansionPanel>
      <ExpansionPanel className={classes.expansionPanel} TransitionProps={{ mountOnEnter: true }}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          className={classes.expansionPanelSummary}
        >
          <Typography variant="h5" className={classes.expansionPanelTitle}>
            Customer Settings
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <TeamsPaymentConfirmationCustomerSettingsTable />
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </Box>
  );
};

export default TeamsPaymentConfirmationContainer;
