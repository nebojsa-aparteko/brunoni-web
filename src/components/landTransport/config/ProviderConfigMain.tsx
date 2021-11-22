import React from 'react';
import { Box, IconButton, makeStyles, Typography } from '@material-ui/core';
import SimpleExpansionPanel from '../../SimpleExpansionPanel';
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
  const history = useHistory();
  const profits = useLandTransportProfits(provider.id);
  const { isOpen, openModal, closeModal } = useModal();
  return (
    <>
      <Box className={classes.accordionContainer}>
        <Box display="flex" justifyContent="space-between" flex={1} my={2}>
          <Box display="flex" flexDirection="row" alignSelf="flex-start">
            <IconButton onClick={() => history.goBack()}>
              <ArrowBackIcon />
            </IconButton>
            <Typography className={classes.title} variant="h1">
              {provider.name}
            </Typography>
          </Box>
          <IconButton onClick={openModal}>
            <SettingsIcon />
          </IconButton>
        </Box>
        <SimpleExpansionPanel label="Profit" fullWidth TransitionProps={{ mountOnEnter: true }}>
          <Box display="flex" flexDirection="column">
            <EditableTable
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
            <EditableTable
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
        </SimpleExpansionPanel>

        <SimpleExpansionPanel label="Automatic Routes" fullWidth TransitionProps={{ mountOnEnter: true }}>
          <RoutesTable provider={provider} />
        </SimpleExpansionPanel>

        <SimpleExpansionPanel label="Semi-automatic routes" fullWidth TransitionProps={{ mountOnEnter: true }}>
          <Box display="flex" flexDirection="column">
            <PricelistConfig provider={provider} />
          </Box>
        </SimpleExpansionPanel>
        <SimpleExpansionPanel label="Manual routes" fullWidth TransitionProps={{ mountOnEnter: true }}>
          <ManualRoutesList providerId={provider.id} />
        </SimpleExpansionPanel>
      </Box>
      {isOpen && <PredefinedAddOnRatesModal isOpen={isOpen} handleClose={closeModal} providerId={provider.id} />}
    </>
  );
};

export default ProviderConfigMain;
