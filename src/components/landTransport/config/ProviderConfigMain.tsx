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
  addLandTransportPricelist,
  addLandTransportProfit,
  deleteLandTransportPricelist,
  deleteLandTransportProfit,
  editLandTransportPricelist,
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
import useLandTransportPricelists from '../../../hooks/useLandTransportPricelists';
import ProviderPricelistEntity, {
  ProviderPricelistCategory,
} from '../../../model/land-transport/providers/ProviderPricelists';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { useHistory } from 'react-router';
import ManualRoutesList from './routes/ManualRoutesList';
const defaultItem = {
  price: { value: 0, currency: Currency.EUR },
  containerType: '',
  type: ProviderProfitType.DEFAULT,
  id: '',
  createdAt: new Date(),
} as DefaultProviderProfitEntity;

const specificItem = {
  price: { value: 0, currency: Currency.EUR },
  containerType: '',
  type: ProviderProfitType.SPECIFIC,
  id: '',
  createdAt: new Date(),
  port: '',
  category: BookingCategory.Import,
} as SpecificProviderProfitEntity;

const defaultExportPricelistItem = {
  prices: [
    { value: 0, currency: Currency.EUR },
    { value: 0, currency: Currency.EUR },
  ],
  category: ProviderPricelistCategory.EXPORT,
  id: '',
  createdAt: new Date(),
} as ProviderPricelistEntity;

const defaultImportPricelistItem = {
  prices: [
    { value: 0, currency: Currency.EUR },
    { value: 0, currency: Currency.EUR },
  ],
  category: ProviderPricelistCategory.IMPORT,
  id: '',
  createdAt: new Date(),
} as ProviderPricelistEntity;

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
  const pricelists = useLandTransportPricelists(provider.id);
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
                { label: 'Container type', fieldType: 'input', fieldName: 'containerType' },
                { label: 'Price', fieldType: 'input', fieldName: 'price.value', inputProps: { type: 'number' } },
                {
                  label: 'Currency',
                  fieldType: 'select',
                  fieldName: 'price.currency',
                  options: Object.values(Currency).map(value => ({ key: value, label: capitalCase(value) })),
                },
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
                { label: 'Container type', fieldType: 'input', fieldName: 'containerType' },
                { label: 'Price', fieldType: 'input', fieldName: 'price.value', inputProps: { type: 'number' } },
                {
                  label: 'Currency',
                  fieldType: 'select',
                  fieldName: 'price.currency',
                  options: Object.values(Currency).map(value => ({ key: value, label: capitalCase(value) })),
                },
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
            Export
            <EditableTable
              cells={[
                { label: 'Distance', fieldType: 'input', fieldName: 'distance' },
                { label: "20' DV", fieldType: 'input', fieldName: 'prices[0].value', inputProps: { type: 'number' } },
                //currency is not working currently, waiting on prices list refactor
                {
                  label: 'Currency',
                  fieldType: 'select',
                  fieldName: 'prices[0].currency',
                  options: Object.values(Currency).map(value => ({ key: value, label: capitalCase(value) })),
                },
                { label: "40' DV", fieldType: 'input', fieldName: 'prices[1].value', inputProps: { type: 'number' } },
                //currency is not working currently, waiting on prices list refactor
                {
                  label: 'Currency',
                  fieldType: 'select',
                  fieldName: 'prices[1].currency',
                  options: Object.values(Currency).map(value => ({ key: value, label: capitalCase(value) })),
                },
              ]}
              defaultItem={defaultExportPricelistItem}
              data={pricelists?.exportPricelistEntities}
              addItem={item => addLandTransportPricelist(provider.id, item)}
              editItem={(id, item) => editLandTransportPricelist(provider.id, id, item)}
              deleteItem={id => deleteLandTransportPricelist(provider.id, id)}
            />
            Import
            <EditableTable
              cells={[
                { label: 'Distance', fieldType: 'input', fieldName: 'distance' },
                { label: "20' DV", fieldType: 'input', fieldName: 'prices[0].value', inputProps: { type: 'number' } },
                //currency is not working currently, waiting on prices list refactor
                {
                  label: 'Currency',
                  fieldType: 'select',
                  fieldName: 'prices[0].currency',
                  options: Object.values(Currency).map(value => ({ key: value, label: capitalCase(value) })),
                },
                { label: "40' DV", fieldType: 'input', fieldName: 'prices[1].value', inputProps: { type: 'number' } },
                //currency is not working currently, waiting on prices list refactor
                {
                  label: 'Currency',
                  fieldType: 'select',
                  fieldName: 'prices[1].currency',
                  options: Object.values(Currency).map(value => ({ key: value, label: capitalCase(value) })),
                },
              ]}
              defaultItem={defaultImportPricelistItem}
              data={pricelists?.importPricelistEntities}
              addItem={item => addLandTransportPricelist(provider.id, item)}
              editItem={(id, item) => editLandTransportPricelist(provider.id, id, item)}
              deleteItem={id => deleteLandTransportPricelist(provider.id, id)}
            />
          </Box>
        </SimpleExpansionPanel>
        <SimpleExpansionPanel label="Manual routes" fullWidth TransitionProps={{ mountOnEnter: true }}>
          <ManualRoutesList providerId={provider.id} />
        </SimpleExpansionPanel>
      </Box>
      {isOpen && <PredefinedAddOnRatesModal isOpen={isOpen} handleClose={closeModal} />}
    </>
  );
};

export default ProviderConfigMain;
