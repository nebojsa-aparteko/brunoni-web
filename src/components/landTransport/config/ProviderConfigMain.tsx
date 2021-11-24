import React from 'react';
import { Box, Button, IconButton, makeStyles, Paper, Typography } from '@material-ui/core';
import ProviderEntity from '../../../model/land-transport/providers/Provider';
import SettingsIcon from '@material-ui/icons/Settings';
import useModal from '../../../hooks/useModal';
import PredefinedAddOnRatesModal from './PredefinedAddOnRatesModal';
import RoutesTable from './routes/RoutesTable';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useHistory } from 'react-router';
import ManualRoutesList from './routes/ManualRoutesList';
import PricelistConfig from './PricelistConfig';
import ProfitTables from './ProfitTables';

const useStyles = makeStyles(() => ({
  accordionContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  expansionPanel: {
    marginBottom: 8,
    width: '1000px',
  },
  expansionPanelSummary: {
    display: 'flex',
  },
  expansionPanelTitle: {
    alignSelf: 'center',
    marginRight: 16,
  },
  icon: {
    cursor: 'pointer',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
}));

const ProviderConfigMain: React.FC<{ provider: ProviderEntity }> = ({ provider }) => {
  const classes = useStyles();
  const history = useHistory();
  const { isOpen, openModal, closeModal } = useModal();
  return (
    <>
      <Box className={classes.accordionContainer}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-end" flex={1} my={4}>
          <Box px={2} display="flex" flexDirection="column" alignSelf="flex-start">
            <Box ml={-0.5}>
              <Button startIcon={<ArrowBackIcon />} color="primary" onClick={() => history.goBack()}>
                All providers
              </Button>
            </Box>
            <Typography variant="h1">{provider.name}</Typography>
          </Box>
          <Box>
            <IconButton onClick={openModal}>
              <SettingsIcon />
            </IconButton>
          </Box>
        </Box>

        <Box component={Paper} p={2}>
          <Typography variant="h2" gutterBottom>
            Profit
          </Typography>
          <ProfitTables providerId={provider.id} />
        </Box>

        <Box mt={10}>
          <Box pl={2} mb={4}>
            <Typography variant="h2" gutterBottom>
              Automatic Routes
            </Typography>
          </Box>
          <RoutesTable provider={provider} />
        </Box>

        <Box mt={10}>
          <Box pl={2}>
            <Typography variant="h2">Semi-automatic routes</Typography>
          </Box>
          <Box display="flex" flexDirection="column" mt={4}>
            <PricelistConfig provider={provider} />
          </Box>
        </Box>

        <Box my={10}>
          <Box pl={2}>
            <Typography variant="h2" gutterBottom>
              Manual routes
            </Typography>
          </Box>
          <ManualRoutesList provider={provider} />
        </Box>
      </Box>
      {isOpen && <PredefinedAddOnRatesModal isOpen={isOpen} handleClose={closeModal} providerId={provider.id} />}
    </>
  );
};

export default ProviderConfigMain;
