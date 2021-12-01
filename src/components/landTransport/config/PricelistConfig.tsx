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
import useLandTransportPricelists from '../../../hooks/useLandTransportPricelists';
import ProviderEntity from '../../../model/land-transport/providers/Provider';
import EditableTable, { CellType } from '../../EditableTable';
import { capitalCase } from 'change-case';
import FirestoreCollectionProvider from '../../../providers/FirestoreCollection';
import Countries from '../../../contexts/Countries';
import RouteFromCity from '../../../model/RouteFromCity';
import firebase from '../../../firebase';
import flatten from 'lodash/fp/flatten';
import useGlobalAppState from '../../../hooks/useGlobalAppState';
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
import EditIcon from '@material-ui/icons/Edit';
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

const PricelistTable: React.FC<TableProps> = ({ tableTitle, provider, pricelists, category, route }) => {
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
          options: Object.values(Currency).map(value => ({ key: value, label: capitalCase(value) })),
        },

        ...containersCells,
      ]}
      defaultItem={
        category === ProviderPricelistCategory.EXPORT ? defaultExportPricelistItem : defaultImportPricelistItem
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
const savePricelistRoutes = async (
  provider: ProviderEntity,
  selectedRoutes: RouteFromCity[],
  selectedPricelists: {
    exportPricelistEntities: ProviderPricelistEntity[];
    importPricelistEntities: ProviderPricelistEntity[];
  },
) => {
  const pricelistIds = selectedPricelists.exportPricelistEntities
    .map(p => p.id)
    .concat(selectedPricelists.importPricelistEntities.map(p => p.id));
  const promises = flatten(
    pricelistIds.map(async id => {
      const ref = firebase
        .firestore()
        .collection(`land-transport-config`)
        .doc(provider.id)
        .collection('pricelist')
        .doc(id)
        .collection('routes');

      return Promise.all(selectedRoutes.map(route => ref.doc(route.id).set(route, { merge: true })));
    }),
  );
  return Promise.all(promises);
};

interface Props {
  provider: ProviderEntity;
}
const PricelistConfig: React.FC<Props> = ({ provider }) => {
  const routes = useLandTransportRoutes<SemiAutomaticProviderRouteEntity>(
    provider.id,
    ProviderRoutesType.SEMI_AUTOMATIC,
  );
  const [, dispatch] = useGlobalAppState();
  //
  // const handleSavePricelistRoutes = async (selectedRoutes: RouteFromCity[]) => {
  //   return savePricelistRoutes(provider, selectedRoutes, pricelists)
  //     .then(() => {
  //       dispatch({ type: 'SHOW_SUCCESS_SNACKBAR', message: 'Successfully saved pricelists!', duration: 2500 });
  //     })
  //     .catch(e => {
  //       dispatch({ type: 'SHOW_ERROR_SNACKBAR', message: e, duration: 3500 });
  //     })
  //     .finally(() => {
  //       console.log('Saved');
  //       return;
  //     });
  // };
  const [destination, setSelectedDestination] = useState<Destination | null>(null);
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
            <CityInput
              onSelect={(value, path) =>
                setSelectedDestination(prevState =>
                  set(path, value)(prevState && value ? prevState : ({} as Destination)),
                )
              }
              origin={destination}
            />
            <IconButton
              onClick={() => {
                addLandTransportRoute(provider.id, {
                  type: ProviderRoutesType.SEMI_AUTOMATIC,
                  active: false,
                  origin: destination,
                  transportMode: 'Barge',
                } as SemiAutomaticProviderRoute).then(() => {
                  setNewRow(false);
                  setSelectedDestination(null);
                });
              }}
            >
              <CheckIcon />
            </IconButton>
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
          routes.map(route => <SemiAutomaticRouteRow key={route.id} route={route} provider={provider} />)
        )}
      </Box>
    </FirestoreCollectionProvider>
  );
};

interface SemiAutomaticRouteRowProps {
  provider: ProviderEntity;
  route: SemiAutomaticProviderRouteEntity;
}

const SemiAutomaticRouteRow: React.FC<SemiAutomaticRouteRowProps> = ({ route, provider }) => {
  const priceLists = useLandTransportPricelists(provider.id, route.id);
  const [isEditing, setEditing] = useState(false);
  const [destination, setSelectedDestination] = useState<Destination>(route.origin);
  const [selectedRoutes, setSelectedRoutes] = useState<RouteFromCity[]>([]);
  const handleSavePricelistRoutes = async () => {};
  return (
    <Box
      border={1}
      p={2}
      borderRadius={5}
      borderColor="primary"
      display="flex"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
    >
      <Box display="flex" flexDirection="row" alignItems="center">
        <CityInput
          onSelect={(value, path) => setSelectedDestination(prevState => set(path, value)(prevState))}
          origin={destination}
        />
        <SeparatorArrow />
        <RoutesMultiInput
          startingDestination={destination}
          selectedRoutes={selectedRoutes}
          setSelectedRoutes={setSelectedRoutes}
        />
      </Box>
      {isEditing ? (
        <Box display="flex">
          <IconButton
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              setEditing(false);
            }}
          >
            <CheckIcon />
          </IconButton>
          <IconButton
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              setEditing(false);
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      ) : (
        <Box>
          <IconButton
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              setEditing(true);
            }}
          >
            <EditIcon />
          </IconButton>
        </Box>
      )}

      {/*<PricelistTable*/}
      {/*  route={route}*/}
      {/*  tableTitle="Export"*/}
      {/*  provider={provider}*/}
      {/*  pricelists={priceLists?.exportPricelistEntities}*/}
      {/*  category={ProviderPricelistCategory.EXPORT}*/}
      {/*/>*/}
      {/*<PricelistTable*/}
      {/*  route={route}*/}
      {/*  tableTitle="Import"*/}
      {/*  provider={provider}*/}
      {/*  pricelists={priceLists?.importPricelistEntities}*/}
      {/*  category={ProviderPricelistCategory.IMPORT}*/}
      {/*/>*/}
    </Box>
  );
};

export default PricelistConfig;
