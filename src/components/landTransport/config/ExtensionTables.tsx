import { Box, ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary } from '@material-ui/core';
import EditingInput from '../../EditingInput';
import EditableTable from '../../EditableTable';
import { set } from 'lodash/fp';
import {
  addLandTransportExtension,
  deleteLandTransportExtension,
  editLandTransportExtension,
} from '../../../api/landTransportConfig';
import React from 'react';
import { Currency } from '../../../model/Payment';
import { capitalCase } from 'change-case';
import useLandTransportExtensionConfig from '../../../hooks/useLandTransportExtensionConfig';
import useLandTransportExtensions from '../../../hooks/useLandTransportExtensions';
import {
  AddOnOfferProviderConfig,
  IncludedOfferProviderConfig,
  OfferProviderConfigType,
  ProviderConfigType,
} from '../../../model/land-transport/providers/ProviderConfig';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

interface Props {
  providerId: string;
}
const ExtensionTables: React.FC<Props> = ({ providerId }) => {
  const extensionConfigs = useLandTransportExtensionConfig(providerId);
  const extensions = useLandTransportExtensions(providerId);
  return (
    <>
      <Box display="flex" flexDirection="column">
        <ExpansionPanel defaultExpanded={false}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" flex={1}>
              <EditingInput
                editing={false}
                value="Barge"
                typographyProps={{ variant: 'h4', style: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' } }}
              />
              <EditingInput
                editing={false}
                value="Import"
                typographyProps={{ variant: 'h4', style: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' } }}
              />
              <EditingInput
                editing={false}
                value="France"
                typographyProps={{ variant: 'h4', style: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' } }}
              />
              <EditingInput
                editing={false}
                value="20' DC"
                typographyProps={{ variant: 'h4', style: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' } }}
              />
            </Box>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails style={{ display: 'flex', flexDirection: 'column' }}>
            <EditableTable
              tableTitle="Included items"
              actionLabel="Add included item"
              data={extensions?.included}
              cells={[
                {
                  label: 'Included',
                  fieldType: 'autocomplete',
                  options: extensionConfigs || [],
                  fieldName: 'extension',
                  autocompleteProps: {
                    getOptionLabel: option => option.name,
                    getOptionSelected: (option, value) => option.id === value.id,
                  },
                  renderValue: value => value.name,
                },
              ]}
              defaultItem={set('extension', extensionConfigs?.[0])(included)}
              addItem={item => addLandTransportExtension(providerId, item)}
              editItem={(id, item) => editLandTransportExtension(providerId, id, item)}
              deleteItem={id => deleteLandTransportExtension(providerId, id)}
            />
            <EditableTable
              tableTitle="Add-on items"
              actionLabel="Add add-on"
              cells={[
                { label: 'Add-on', fieldType: 'input', fieldName: 'extension.name' },
                { label: 'Price', fieldType: 'input', fieldName: 'price.value' },
                {
                  label: 'Currency',
                  fieldType: 'select',
                  fieldName: 'price.currency',
                  options: Object.values(Currency).map(value => ({ key: value, label: capitalCase(value) })),
                },
              ]}
              defaultItem={addOn}
              addItem={item => addLandTransportExtension(providerId, item)}
              editItem={(id, item) => editLandTransportExtension(providerId, id, item)}
              deleteItem={id => deleteLandTransportExtension(providerId, id)}
            />
          </ExpansionPanelDetails>
        </ExpansionPanel>
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
  extension: {
    name: '',
  },
  price: {
    value: 0,
    currency: Currency.EUR,
  },
} as AddOnOfferProviderConfig;

export default ExtensionTables;
