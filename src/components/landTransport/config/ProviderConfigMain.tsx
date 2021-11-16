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

        <SimpleExpansionPanel label="Routes" fullWidth TransitionProps={{ mountOnEnter: true }}>
          <RoutesTable provider={provider} />
        </SimpleExpansionPanel>
      </Box>
      {isOpen && <PredefinedAddOnRatesModal isOpen={isOpen} handleClose={closeModal} />}
    </>
  );
};

export default ProviderConfigMain;
