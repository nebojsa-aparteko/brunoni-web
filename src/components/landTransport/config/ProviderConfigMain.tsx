import React from 'react';
import { Box, Button, IconButton, makeStyles, Typography } from '@material-ui/core';
import ProviderEntity from '../../../model/land-transport/providers/Provider';
import useLandTransportProfits from '../../../hooks/useLandTransportProfits';
import SettingsIcon from '@material-ui/icons/Settings';
import useModal from '../../../hooks/useModal';
import PredefinedAddOnRatesModal from './PredefinedAddOnRatesModal';
import RoutesTable from './routes/RoutesTable';
import EditableTable from '../../EditableTable';
import {
  addLandTransportProfit,
  deleteLandTransportProfit,
  editLandTransportProfit,
} from '../../../api/landTransportConfig';
import { Currency } from '../../../model/Payment';
import { capitalCase } from 'change-case';
import {
  DefaultProviderProfitEntity,
  ProviderProfitType,
  SpecificProviderProfitEntity,
} from '../../../model/land-transport/providers/ProviderProfit';
import { BookingCategory } from '../../../model/Booking';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useHistory } from 'react-router';
import ManualRoutesList from './routes/ManualRoutesList';
import PricelistConfig, { containersCells } from './PricelistConfig';

const defaultItem = {
  type: ProviderProfitType.DEFAULT,
  id: '',
  createdAt: new Date(),
  pricePerContainer: {},
  currency: Currency.EUR,
} as DefaultProviderProfitEntity;

const specificItem = {
  type: ProviderProfitType.SPECIFIC,
  id: '',
  createdAt: new Date(),
  pricePerContainer: {},
  currency: Currency.EUR,
  port: '',
  category: BookingCategory.Export,
} as SpecificProviderProfitEntity;

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
  const profits = useLandTransportProfits(provider.id);
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

        <Box>
          <Box pl={2}>
            <Typography variant="h2" gutterBottom>
              Profit
            </Typography>
          </Box>
          <Box my={4}>
            <EditableTable
              tableTitle="Containers"
              actionLabel="Add Container"
              cells={[
                {
                  label: 'Currency',
                  fieldType: 'select',
                  fieldName: 'currency',
                  options: Object.values(Currency).map(value => ({ key: value, label: capitalCase(value) })),
                },
                ...containersCells,
              ]}
              defaultItem={defaultItem}
              data={profits?.defaultProfit}
              addItem={item => addLandTransportProfit(provider.id, item)}
              editItem={(id, item) => editLandTransportProfit(provider.id, id, item)}
              deleteItem={id => deleteLandTransportProfit(provider.id, id)}
            />
          </Box>

          <Box>
            <EditableTable
              tableTitle="Categories"
              actionLabel="Add Category"
              cells={[
                { label: 'Category', fieldType: 'input', fieldName: 'category' },
                { label: 'Port', fieldType: 'input', fieldName: 'port' },
                {
                  label: 'Currency',
                  fieldType: 'select',
                  fieldName: 'currency',
                  options: Object.values(Currency).map(value => ({ key: value, label: capitalCase(value) })),
                },
                ...containersCells,
              ]}
              defaultItem={specificItem}
              data={profits?.specificProfit}
              addItem={item => addLandTransportProfit(provider.id, item)}
              editItem={(id, item) => editLandTransportProfit(provider.id, id, item)}
              deleteItem={id => deleteLandTransportProfit(provider.id, id)}
            />
          </Box>
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
          <ManualRoutesList providerId={provider.id} />
        </Box>
      </Box>
      {isOpen && <PredefinedAddOnRatesModal isOpen={isOpen} handleClose={closeModal} providerId={provider.id} />}
    </>
  );
};

export default ProviderConfigMain;
