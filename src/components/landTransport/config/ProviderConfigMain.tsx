import React from 'react';
import { Box, IconButton, makeStyles, Typography } from '@material-ui/core';
import SimpleExpansionPanel from '../../SimpleExpansionPanel';
import ProviderEntity from '../../../model/land-transport/providers/Provider';
import useLandTransportProfits from '../../../hooks/useLandTransportProfits';
import ProviderProfitConfigTable from './ProviderProfitConfigTable';
import SettingsIcon from '@material-ui/icons/Settings';
import useModal from '../../../hooks/useModal';
import PredefinedAddOnRatesModal from './PredefinedAddOnRatesModal';

const useStyles = makeStyles(() => ({
  accordionContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    alignSelf: 'start',
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
  const profits = useLandTransportProfits(provider.id);
  const { isOpen, openModal, closeModal } = useModal();
  return (
    <>
      <Box className={classes.accordionContainer}>
        <Box display="flex" justifyContent="space-between">
          <Typography className={classes.title} variant="h1">
            {provider.name}
          </Typography>
          <IconButton onClick={openModal}>
            <SettingsIcon />
          </IconButton>
        </Box>
        <SimpleExpansionPanel label="Profit" fullWidth>
          <Box display="flex" flexDirection="column">
            <ProviderProfitConfigTable provider={provider} profits={profits?.defaultProfit} />
            <ProviderProfitConfigTable provider={provider} profits={profits?.specificProfit} isSpecific />
          </Box>
        </SimpleExpansionPanel>

        <SimpleExpansionPanel label="Routes" fullWidth>
          <Box>
            <Typography>Test</Typography>
          </Box>
        </SimpleExpansionPanel>
      </Box>
      {isOpen && <PredefinedAddOnRatesModal isOpen={isOpen} handleClose={closeModal} />}
    </>
  );
};

export default ProviderConfigMain;
