import React, { ChangeEvent, useState } from 'react';
import useLandTransportExtensionsGroup from '../../../../hooks/useLandTransportExtensionsGroup';
import { Box, Button, IconButton, TextField } from '@material-ui/core';
import ExtensionTables from '../ExtensionTables';
import ProviderEntity from '../../../../model/land-transport/providers/Provider';
import theme from '../../../../theme';
import {
  ProviderExtensionGroup,
  ProviderExtensionGroupType,
} from '../../../../model/land-transport/providers/ProviderConfig';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import { set } from 'lodash/fp';
import { addLandTransportExtensionGroup } from '../../../../api/landTransportConfig';

interface Props {
  provider: ProviderEntity;
  routeId: string;
}

const ExtensionsContainer: React.FC<Props> = ({ provider, routeId }) => {
  const extensionGroup = useLandTransportExtensionsGroup(provider.id, routeId);
  const [newRow, setNewRow] = useState(false);
  const [stateGroup, setStateGroup] = useState(defaultGroup);
  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const key = event.target?.name;
    const value = event.target.value;
    const type = event.target.type;
    key && setStateGroup((prevState: any) => set(key, type === 'number' ? +value : value)(prevState));
  };
  return (
    <Box display="flex" flexDirection="column" style={{ gap: theme.spacing(2) }}>
      <Button
        variant="contained"
        color="primary"
        size="small"
        style={{ alignSelf: 'flex-end', marginBottom: theme.spacing(2) }}
        disabled={newRow}
        onClick={() => setNewRow(true)}
      >
        Add extensions group
      </Button>
      {newRow && (
        <Box display="flex" style={{ gap: theme.spacing(2) }}>
          <TextField
            label="Transport Mode"
            margin="dense"
            variant="outlined"
            name="transportMode"
            onChange={handleInputChange}
            fullWidth
            value={stateGroup.transportMode}
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
            }}
          />
          <TextField
            label="Category"
            margin="dense"
            variant="outlined"
            name="category"
            onChange={handleInputChange}
            fullWidth
            value={stateGroup.category}
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
            }}
          />
          <TextField
            label="Equipment Type"
            margin="dense"
            variant="outlined"
            fullWidth
            name="equipmentType"
            onChange={handleInputChange}
            value={stateGroup.equipmentType}
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
            }}
          />
          <TextField
            label="Country"
            margin="dense"
            variant="outlined"
            fullWidth
            name="country"
            onChange={handleInputChange}
            value={stateGroup.country}
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
            }}
          />
          <Box display="flex">
            <IconButton
              onClick={() =>
                addLandTransportExtensionGroup(provider.id, routeId, stateGroup).then(() => setNewRow(false))
              }
            >
              <CheckIcon />
            </IconButton>
            <IconButton onClick={() => setNewRow(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      )}
      {extensionGroup?.map(val => (
        <ExtensionTables provider={provider} routeId={routeId} group={val} key={val.id} />
      ))}
    </Box>
  );
};

export default ExtensionsContainer;

const defaultGroup = {
  type: ProviderExtensionGroupType.SPECIFIC,
  equipmentType: undefined,
  country: '',
  category: undefined,
  transportMode: '',
} as ProviderExtensionGroup;
