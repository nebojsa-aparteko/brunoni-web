import React, { useState } from 'react';
import ManualRouteShortView from './ManualRouteShortView';
import { Box, Button, Paper } from '@material-ui/core';
import { Currency } from '../../../../model/Payment';
import {
  ManualProviderRouteEntity,
  PricePerContainer,
  ProviderRoutesType,
} from '../../../../model/land-transport/providers/ProviderRoutes';
import theme from '../../../../theme';
import { addLandTransportRoute, editLandTransportRoute } from '../../../../api/landTransportConfig';
import { set } from 'lodash/fp';
import useLandTransportRoutes from '../../../../hooks/useLandTransportRoutes';
import AddIcon from '@material-ui/icons/Add';
import EmptyStatePanel from '../../../EmptyStatePanel';

//@ts-ignore
const defaultItem = {
  type: ProviderRoutesType.MANUAL,
  price: { currency: Currency.CHF, value: 300 },
  transportMode: '',
  destination: '',
  origin: '',
  currency: Currency.EUR,
  active: false,
} as ManualProviderRouteEntity;
interface Props {
  providerId: string;
}
const ManualRoutesList: React.FC<Props> = ({ providerId }) => {
  const [newRow, setNewRow] = useState(false);
  const routes = useLandTransportRoutes(providerId, ProviderRoutesType.MANUAL);

  return (
    <Box display="flex" flexDirection="column" flex={1}>
      {routes?.length !== 0 && (
        <Button
          variant="contained"
          color="primary"
          size="small"
          style={{ alignSelf: 'flex-end', marginBottom: theme.spacing(2) }}
          disabled={newRow}
          onClick={() => setNewRow(true)}
        >
          Add route
        </Button>
      )}

      <Box display="flex" flexDirection="column" flex={1} style={{ gap: theme.spacing(2) }}>
        {newRow && (
          <ManualRouteShortView
            route={defaultItem}
            isAddMode
            onCancel={() => setNewRow(false)}
            addItem={item =>
              addLandTransportRoute(
                providerId,
                set('priceRange', getRangePricesByContainer(item.pricePerContainer, item.currency))(item),
              )
            }
            editItem={(id, item) =>
              editLandTransportRoute(
                providerId,
                id,
                set('priceRange', getRangePricesByContainer(item.pricePerContainer, item.currency))(item),
              )
            }
          />
        )}
        {routes?.length !== 0 ? (
          routes?.map(v => (
            <ManualRouteShortView
              route={v}
              key={v.id}
              addItem={item =>
                addLandTransportRoute(
                  providerId,
                  set('priceRange', getRangePricesByContainer(item.pricePerContainer, item.currency))(item),
                )
              }
              editItem={(id, item) =>
                editLandTransportRoute(
                  providerId,
                  id,
                  set('priceRange', getRangePricesByContainer(item.pricePerContainer, item.currency))(item),
                )
              }
            />
          ))
        ) : (
          <Box mt={3} component={Paper}>
            <EmptyStatePanel
              title="No manual routes"
              subtitle="Click the button below to create the first manual route"
              actionLabel="Add route"
              actionIcon={<AddIcon />}
              action={() => setNewRow(true)}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

const getRangePricesByContainer = (priceByContainer: PricePerContainer, currency: Currency) => {
  if (!priceByContainer) return undefined;
  return Object.values(priceByContainer).reduce(
    (previousValue, currentValue, index) => {
      if (index === 0)
        return { min: { value: currentValue.value, currency }, max: { value: currentValue.value, currency } };
      if (previousValue.max.value < currentValue.value) {
        return set('max.value', currentValue.value)(previousValue);
      } else if (previousValue.min.value > currentValue.value) {
        return set('min.value', currentValue.value)(previousValue);
      } else {
        return previousValue;
      }
    },
    { min: { value: Number.MAX_VALUE, currency }, max: { value: Number.MIN_VALUE, currency } },
  );
};

export default ManualRoutesList;
