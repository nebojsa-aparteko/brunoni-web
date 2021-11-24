import EditableTable from '../../EditableTable';
import { Currency } from '../../../model/Payment';
import { capitalCase } from 'change-case';
import { containersCells } from './PricelistConfig';
import {
  addLandTransportProfit,
  deleteLandTransportProfit,
  editLandTransportProfit,
} from '../../../api/landTransportConfig';
import React from 'react';
import {
  DefaultProviderProfitEntity,
  ProviderProfitType,
  SpecificProviderProfitEntity,
} from '../../../model/land-transport/providers/ProviderProfit';
import { BookingCategory } from '../../../model/Booking';
import useLandTransportProfits from '../../../hooks/useLandTransportProfits';
import { Box } from '@material-ui/core';
import theme from '../../../theme';

interface Props {
  providerId: string;
}

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

const ProfitTables: React.FC<Props> = ({ providerId }) => {
  const profits = useLandTransportProfits(providerId);

  return (
    <Box display="flex" flexDirection="column" style={{ gap: theme.spacing(4) }}>
      <EditableTable
        tableTitle="Default profit"
        cells={[
          {
            label: 'Currency',
            fieldType: 'select',
            fieldName: 'currency',
            options: Object.values(Currency).map(value => ({ key: value, label: capitalCase(value) })),
          },
          ...containersCells,
        ]}
        actionLabel="Add default profit"
        defaultItem={defaultItem}
        data={profits?.defaultProfit}
        addItem={item => addLandTransportProfit(providerId, item)}
        editItem={(id, item) => editLandTransportProfit(providerId, id, item)}
        deleteItem={id => deleteLandTransportProfit(providerId, id)}
      />
      <EditableTable
        tableTitle="Specific routes profit"
        actionLabel="Add specific profit"
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
        addItem={item => addLandTransportProfit(providerId, item)}
        editItem={(id, item) => editLandTransportProfit(providerId, id, item)}
        deleteItem={id => deleteLandTransportProfit(providerId, id)}
      />
    </Box>
  );
};

export default ProfitTables;
