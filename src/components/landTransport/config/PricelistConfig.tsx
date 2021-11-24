import React, { useMemo } from 'react';
import { Box } from '@material-ui/core';
import ProviderPricelistEntity, {
  ProviderPricelistCategory,
} from '../../../model/land-transport/providers/ProviderPricelists';
import { get } from 'lodash/fp';
import { EquipmentControlContainerTypes } from '../../../model/EquipmentControl';
import { Currency } from '../../../model/Payment';
import {
  addLandTransportPricelist,
  deleteLandTransportPricelist,
  editLandTransportPricelist,
} from '../../../api/landTransportConfig';
import useLandTransportPricelists from '../../../hooks/useLandTransportPricelists';
import ProviderEntity from '../../../model/land-transport/providers/Provider';
import ChartsCircularProgress from '../../dashboard/ChartsCircularProgress';
import EditableTable, { CellType } from '../../EditableTable';
import { capitalCase } from 'change-case';
import SemiAutomaticRoutes from './routes/SemiAutomaticRoutes';
import FirestoreCollectionProvider from '../../../providers/FirestoreCollection';
import Countries from '../../../contexts/Countries';
import RouteFromCity from '../../../model/RouteFromCity';
import firebase from '../../../firebase';
import flatten from 'lodash/fp/flatten';
import useGlobalAppState from '../../../hooks/useGlobalAppState';

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

const PricelistTable: React.FC<TableProps> = ({ tableTitle, provider, pricelists, category }) => {
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
      addItem={item => addLandTransportPricelist(provider.id, item)}
      editItem={(id, item) => editLandTransportPricelist(provider.id, id, item)}
      deleteItem={id => deleteLandTransportPricelist(provider.id, id)}
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
  const promisses = flatten(
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
  return Promise.all(promisses);
};

interface Props {
  provider: ProviderEntity;
}
const PricelistConfig: React.FC<Props> = ({ provider }) => {
  const pricelists = useLandTransportPricelists(provider.id);
  const [, dispatch] = useGlobalAppState();

  const handleSavePricelistRoutes = async (selectedRoutes: RouteFromCity[]) => {
    return savePricelistRoutes(provider, selectedRoutes, pricelists)
      .then(() => {
        dispatch({ type: 'SHOW_SUCCESS_SNACKBAR', message: 'Successfully saved pricelists!', duration: 2500 });
      })
      .catch(e => {
        dispatch({ type: 'SHOW_ERROR_SNACKBAR', message: e, duration: 3500 });
      })
      .finally(() => {
        console.log('Saved');
        return;
      });
  };

  const exportPricelists = useMemo(
    () => pricelists?.exportPricelistEntities?.sort((a, b) => (a.distance > b.distance ? 1 : -1)),
    [pricelists?.exportPricelistEntities],
  );
  const importPricelists = useMemo(
    () => pricelists?.importPricelistEntities?.sort((a, b) => (a.distance > b.distance ? 1 : -1)),
    [pricelists?.importPricelistEntities],
  );

  return (
    <Box display="flex" flexDirection="column">
      {pricelists ? (
        <React.Fragment>
          <Box mb={4}>
            <FirestoreCollectionProvider name="countries" context={Countries}>
              <SemiAutomaticRoutes savePricelistRoutes={handleSavePricelistRoutes} />
            </FirestoreCollectionProvider>
            <PricelistTable
              tableTitle="Export"
              provider={provider}
              pricelists={exportPricelists}
              category={ProviderPricelistCategory.EXPORT}
            />
          </Box>
          <PricelistTable
            tableTitle="Import"
            provider={provider}
            pricelists={importPricelists}
            category={ProviderPricelistCategory.IMPORT}
          />
        </React.Fragment>
      ) : (
        <ChartsCircularProgress />
      )}
    </Box>
  );
};
export default PricelistConfig;
