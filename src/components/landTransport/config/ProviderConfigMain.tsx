import React from 'react';
import { Box, Button, IconButton, makeStyles, Typography } from '@material-ui/core';
import ProviderEntity from '../../../model/land-transport/providers/Provider';
import SettingsIcon from '@material-ui/icons/Settings';
import useModal from '../../../hooks/useModal';
import PredefinedAddOnRatesModal from './PredefinedAddOnRatesModal';
import RoutesTable from './routes/RoutesTable';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useHistory } from 'react-router';
import ManualRoutesList from './routes/ManualRoutesList';
import PriceListConfig from './PricelistConfig';
import ProfitTables from './ProfitTables';
import SectionWithTitle from '../../SectionWithTitle';

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
}));

const ProviderConfigMain: React.FC<{ provider: ProviderEntity }> = ({ provider }) => {
  const classes = useStyles();
  const history = useHistory();
  const { isOpen, openModal, closeModal } = useModal();
  return (
    <>
      <Box className={classes.container}>
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
        <SectionWithTitle title="Profit">
          <ProfitTables providerId={provider.id} />
        </SectionWithTitle>

        <SectionWithTitle title="Automatic routes">
          <RoutesTable provider={provider} />
        </SectionWithTitle>

        <SectionWithTitle title="Semi-automatic routes">
          <PriceListConfig provider={provider} />
        </SectionWithTitle>

        <SectionWithTitle title="Manual routes">
          <ManualRoutesList provider={provider} />
        </SectionWithTitle>
      </Box>
      {isOpen && <PredefinedAddOnRatesModal isOpen={isOpen} handleClose={closeModal} providerId={provider.id} />}
    </>
  );
};

export default ProviderConfigMain;
