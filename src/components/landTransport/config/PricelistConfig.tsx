import React, { useState } from 'react';
import { Box, Button, IconButton } from '@material-ui/core';
import ProviderPricelistEntity, {
  ProviderPricelistCategory,
} from '../../../model/land-transport/providers/ProviderPricelists';
import { get, set } from 'lodash/fp';
import { EquipmentControlContainerTypes } from '../../../model/EquipmentControl';
import { Currency } from '../../../model/Payment';
import {
  addLandTransportPricelist,
  addLandTransportRoute,
  deleteLandTransportPricelist,
  editLandTransportPricelist,
} from '../../../api/landTransportConfig';
import ProviderEntity from '../../../model/land-transport/providers/Provider';
import EditableTable, { CellType } from '../../EditableTable';
import { capitalCase } from 'change-case';
import FirestoreCollectionProvider from '../../../providers/FirestoreCollection';
import Countries from '../../../contexts/Countries';
import useLandTransportRoutes from '../../../hooks/useLandTransportRoutes';
import {
  ProviderRoutesType,
  SemiAutomaticProviderRoute,
  SemiAutomaticProviderRouteEntity,
} from '../../../model/land-transport/providers/ProviderRoutes';
import CityInput from '../../inputs/CityInput';
import CheckIcon from '@material-ui/icons/Check';
import EmptyStatePanel from '../../EmptyStatePanel';
import Destination from '../../../model/land-transport/Destination';
import AddIcon from '@material-ui/icons/Add';
import theme from '../../../theme';
import CloseIcon from '@material-ui/icons/Close';
import SemiAutomaticRouteRow from './routes/SemiAutomaticRouteRow';
import { EditableTextItem } from './routes/ManualRouteDialog';
import TransportModeInput from '../../inputs/TransportModeInput';
import { SeparatorArrow } from '../../vesselWithVoyage/VesselVoyageItem';
import RoutesMultiInput from '../../inputs/RoutesMultiInuput';

const defaultExportPricelistItem = {
  pricePerContainer: {},
  category: ProviderPricelistCategory.EXPORT,
  distance: 0,
  currency: Currency.EUR,
  id: '',
  createdAt: new Date(),
} as ProviderPricelistEntity;

const defaultImportPricelistItem = {
  pricePerContainer: {},
  category: ProviderPricelistCategory.IMPORT,
  distance: 0,
  currency: Currency.EUR,
  id: '',
  createdAt: new Date(),
} as ProviderPricelistEntity;

interface TableProps {
  tableTitle?: string;
  route: SemiAutomaticProviderRouteEntity;
  provider: ProviderEntity;
  pricelists: ProviderPricelistEntity[];
  category: ProviderPricelistCategory;
}

export const containersCells = Object.keys(EquipmentControlContainerTypes).map(value => ({
  label: get(value)(EquipmentControlContainerTypes),
  fieldType: 'input',
  fieldName: `pricePerContainer.${value}.value`,
  inputProps: {
    type: 'number',
  },
})) as CellType[];

export const PriceListTable: React.FC<TableProps> = ({
  tableTitle,
  provider,
  pricelists,
  category,
  route,
}) => {
  return (
    <EditableTable
      tableTitle={tableTitle}
      cells={[
        {
          label: 'Distance',
          fieldType: 'input',
          fieldName: `distance`,
          inputProps: {
            type: 'number',
          },
          renderValue: value => `Until ${value} km`,
        },
        {
          label: 'Currency',
          fieldType: 'select',
          fieldName: 'currency',
          options: Object.values(Currency).map(value => ({
            key: value,
            label: capitalCase(value),
          })),
        },

        ...containersCells,
      ]}
      defaultItem={
        category === ProviderPricelistCategory.EXPORT
          ? defaultExportPricelistItem
          : defaultImportPricelistItem
      }
      addItem={item => addLandTransportPricelist(provider.id, route.id, item)}
      editItem={(id, item) => editLandTransportPricelist(provider.id, route.id, id, item)}
      deleteItem={id => deleteLandTransportPricelist(provider.id, route.id, id)}
      data={pricelists}
      emptyStateTitle={`${category === ProviderPricelistCategory.EXPORT ? 'Export' : 'Import'} distance table`}
      actionLabel="Add row"
    />
  );
};

interface Props {
  provider: ProviderEntity;
}

const PriceListConfig: React.FC<Props> = ({ provider }) => {
  const routes = useLandTransportRoutes<SemiAutomaticProviderRouteEntity>(
    provider.id,
    ProviderRoutesType.SEMI_AUTOMATIC,
  );
  const [originState, setOriginState] = useState<Destination | null>(null);
  const [transportModeState, setTransportModeState] = useState<string | null>(null);
  const [newRow, setNewRow] = useState(false);
  return (
    <FirestoreCollectionProvider name="countries" context={Countries}>
      <Box display="flex" flexDirection="column" style={{ gap: theme.spacing(2) }}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<AddIcon />}
          style={{ alignSelf: 'flex-end' }}
          onClick={() => {
            setNewRow(true);
          }}
          disabled={newRow}
        >
          Add new route
        </Button>
        {newRow && (
          <Box display="flex" flexDirection="row" flex={1} justifyContent="space-between">
            <Box display="flex" flexDirection="row" alignItems="center">
              <CityInput
                isEditing={true}
                onSelect={(value, path) =>
                  setOriginState(prevState =>
                    set(path, value)(prevState && value ? prevState : ({} as Destination)),
                  )
                }
                origin={originState}
              />
              <SeparatorArrow />
              <RoutesMultiInput isEditing={true} startingDestination={originState} />
            </Box>
            <Box width={'15%'}>
              <EditableTextItem
                editing={true}
                value={transportModeState || ''}
                Element={
                  <TransportModeInput
                    value={transportModeState}
                    label={'Transport Mode'}
                    onChange={transportMode => setTransportModeState(transportMode)}
                  />
                }
              />
            </Box>
            <Box>
              <IconButton
                onClick={() => {
                  addLandTransportRoute(provider.id, {
                    type: ProviderRoutesType.SEMI_AUTOMATIC,
                    active: false,
                    origin: originState,
                    transportMode: transportModeState,
                    selectedRoutes: [],
                    validity: null,
                    description: '',
                  } as SemiAutomaticProviderRoute).then(val => {
                    setNewRow(false);
                    setOriginState(null);
                    setTransportModeState(null);
                  });
                }}
              >
                <CheckIcon />
              </IconButton>
              <IconButton
                onClick={() => {
                  setNewRow(false);
                  setOriginState(null);
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        )}
        {!routes || routes.length < 1 ? (
          <EmptyStatePanel
            title="There is no semi-automatic routes"
            subtitle="Please click on button below and create your first semi automatic route"
            actionLabel="Add semi-automatic route"
            action={() => setNewRow(true)}
          />
        ) : (
          routes.map(route => (
            <SemiAutomaticRouteRow key={route.id} route={route} provider={provider} />
          ))
        )}
      </Box>
    </FirestoreCollectionProvider>
  );
};

export default PriceListConfig;
