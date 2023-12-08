import {
  Box,
  Divider,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  IconButton,
} from '@material-ui/core';
import EditingInput from '../../EditingInput';
import EditableTable from '../../EditableTable';
import { set } from 'lodash/fp';
import {
  addLandTransportExtension,
  deleteLandTransportExtension,
  editLandTransportExtension,
} from '../../../api/landTransportConfig';
import React, { useMemo } from 'react';
import { Currency } from '../../../model/Payment';
import { capitalCase } from 'change-case';
import useLandTransportExtensionConfig from '../../../hooks/useLandTransportExtensionConfig';
import useLandTransportExtensions from '../../../hooks/useLandTransportExtensions';
import {
  AddOnOfferProviderConfig,
  IncludedOfferProviderConfig,
  OfferProviderConfigType,
  ProviderConfigType,
  ProviderExtensionGroupEntity,
  ProviderExtensionGroupType,
} from '../../../model/land-transport/providers/ProviderConfig';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ProviderEntity from '../../../model/land-transport/providers/Provider';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import theme from '../../../theme';

interface Props {
  provider: ProviderEntity;
  routeId: string;
  group: ProviderExtensionGroupEntity;
}
const ExtensionTables: React.FC<Props> = ({ provider, routeId, group }) => {
  const providersExtensionConfigs = useLandTransportExtensionConfig(provider.id, provider.name);
  const defaultExtensionConfigs = useLandTransportExtensionConfig('Default', 'Default');
  const mixedExtensionConfigs = useMemo(() => (providersExtensionConfigs || []).concat(defaultExtensionConfigs || []), [
    defaultExtensionConfigs,
    providersExtensionConfigs,
  ]);
  const extensions = useLandTransportExtensions(provider.id, routeId, group.id);
  const isDefault = group.type === ProviderExtensionGroupType.DEFAULT;
  return (
    <>
      <Box display="flex" flexDirection="column">
        <Box display="flex" flex={1} justifyContent="space-between">
          <ExpansionPanel defaultExpanded={isDefault} style={{ flex: 1 }} TransitionProps={{ unmountOnExit: true }}>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" flex={1}>
                {group.transportMode && (
                  <EditingInput
                    editing={false}
                    value={group.transportMode}
                    typographyProps={{
                      variant: 'h4',
                      style: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' },
                    }}
                  />
                )}
                {group.category && (
                  <EditingInput
                    editing={false}
                    value={group.category}
                    typographyProps={{
                      variant: 'h4',
                      style: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' },
                    }}
                  />
                )}
                {group.country && (
                  <EditingInput
                    editing={false}
                    value={group.country}
                    typographyProps={{
                      variant: 'h4',
                      style: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' },
                    }}
                  />
                )}
                {group.equipmentType && (
                  <EditingInput
                    editing={false}
                    value="20' DC"
                    typographyProps={{
                      variant: 'h4',
                      style: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' },
                    }}
                  />
                )}
              </Box>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing(2) }}>
              <EditableTable
                tableTitle="Included items"
                actionLabel="Add included item"
                data={extensions?.included}
                cells={[
                  {
                    label: 'Included',
                    fieldType: 'autocomplete',
                    options: mixedExtensionConfigs || [],
                    fieldName: 'extension',
                    autocompleteProps: {
                      getOptionLabel: option => option.name,
                      getOptionSelected: (option, value) => option.id === value.id,
                      groupBy: option => option.providerName,
                    },
                    renderValue: value => value.name,
                  },
                ]}
                defaultItem={set('extension', mixedExtensionConfigs?.[0])(included)}
                addItem={item => addLandTransportExtension(provider.id, routeId, group.id, item)}
                editItem={(id, item) => editLandTransportExtension(provider.id, routeId, group.id, id, item)}
                deleteItem={id => deleteLandTransportExtension(provider.id, routeId, group.id, id)}
              />
              <Divider />
              <EditableTable
                tableTitle="Add-on items"
                actionLabel="Add add-on"
                data={extensions?.addOn}
                cells={[
                  {
                    label: 'Add-on',
                    fieldType: 'autocomplete',
                    options: mixedExtensionConfigs || [],
                    fieldName: 'extension',
                    autocompleteProps: {
                      getOptionLabel: option => option.name,
                      getOptionSelected: (option, value) => option.id === value.id,
                      groupBy: option => option.providerName,
                    },
                    renderValue: value => value.name,
                  },
                  {
                    label: 'Price',
                    fieldType: 'input',
                    fieldName: 'price.value',
                    inputProps: {
                      type: 'number',
                    },
                  },
                  {
                    label: 'Currency',
                    fieldType: 'select',
                    fieldName: 'price.currency',
                    options: Object.values(Currency).map(value => ({ key: value, label: capitalCase(value) })),
                  },
                ]}
                defaultItem={set('extension', mixedExtensionConfigs?.[0])(addOn)}
                addItem={item => addLandTransportExtension(provider.id, routeId, group.id, item)}
                editItem={(id, item) => editLandTransportExtension(provider.id, routeId, group.id, id, item)}
                deleteItem={id => deleteLandTransportExtension(provider.id, routeId, group.id, id)}
              />
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <Box display="flex" alignSelf="flex-start">
            <IconButton disabled={isDefault}>
              <EditIcon />
            </IconButton>
            <IconButton disabled={isDefault}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </>
  );
};

const included = {
  id: '',
  type: ProviderConfigType.OFFER,
  offerType: OfferProviderConfigType.INCLUDED,
} as IncludedOfferProviderConfig;

const addOn = {
  id: '',
  type: ProviderConfigType.OFFER,
  offerType: OfferProviderConfigType.ADD_ON,
  price: {
    value: 0,
    currency: Currency.EUR,
  },
} as AddOnOfferProviderConfig;

export default ExtensionTables;
