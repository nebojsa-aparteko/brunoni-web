import React, { ChangeEvent, useState } from 'react';
import { omit, set } from 'lodash/fp';
import { Currency } from '../../../model/Payment';
import { IconButton, MenuItem, Select, TableCell, TableRow } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import ProviderProfitEntity, { ProviderProfit } from '../../../model/land-transport/providers/ProviderProfit';
import EditingInput from '../../EditingInput';

const ProviderProfitConfigTableRow: React.FC<ProviderProfitConfigTableRowProps> = ({
  item,
  saveItem,
  deleteItem,
  isAddMode,
  isSpecific,
}) => {
  const [isEditing, setEditing] = useState(!!isAddMode);
  const [stateItem, setStateItem] = useState(item);

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const key = event.target?.name;
    const value = event.target.value;
    const type = event.target.type;
    key && setStateItem(prevState => set(key, type === 'number' ? +value : value)(prevState));
  };
  const handleSelectChange = (event: ChangeEvent<{ name?: string; value: unknown }>) => {
    event.target?.name &&
      setStateItem(prevState => ({
        ...prevState,
        price: { ...prevState.price, currency: event.target.value as Currency },
      }));
  };

  return (
    <TableRow>
      {isSpecific && (
        <TableCell>
          <EditingInput
            editing={isEditing}
            inputProps={{
              variant: 'outlined',
              label: 'Category',
              name: 'category',
              onChange: handleInputChange,
            }}
            value={stateItem.category}
          />
        </TableCell>
      )}
      {isSpecific && (
        <TableCell>
          <EditingInput
            editing={isEditing}
            inputProps={{
              variant: 'outlined',
              label: 'Port',
              name: 'port',
              onChange: handleInputChange,
            }}
            value={stateItem.port}
          />
        </TableCell>
      )}
      <TableCell>
        <EditingInput
          editing={isEditing}
          inputProps={{
            variant: 'outlined',
            label: 'Container Type',
            name: 'containerType',
            onChange: handleInputChange,
          }}
          value={stateItem.containerType}
        />
      </TableCell>
      <TableCell>
        <EditingInput
          editing={isEditing}
          inputProps={{
            variant: 'outlined',
            label: 'Price',
            name: 'price.value',
            onChange: handleInputChange,
            type: 'number',
          }}
          value={`${stateItem.price.value}`}
        />
      </TableCell>
      <TableCell>
        <Select
          variant="outlined"
          label="Currency"
          value={stateItem.price.currency}
          name="currency"
          onChange={handleSelectChange}
        >
          {Object.values(Currency).map(val => (
            <MenuItem value={val}>{val}</MenuItem>
          ))}
        </Select>
      </TableCell>
      <TableCell align="left">
        {isEditing ? (
          <IconButton
            onClick={() => {
              saveItem(isAddMode ? removeEntityFields(stateItem) : stateItem).finally(() => setEditing(false));
            }}
          >
            <CheckIcon />
          </IconButton>
        ) : (
          <IconButton onClick={() => setEditing(true)}>
            <EditIcon />
          </IconButton>
        )}
        <IconButton
          onClick={() => {
            deleteItem(item.id).finally(() => {
              console.log('Test');
            });
          }}
        >
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

const removeEntityFields = (item: ProviderProfitEntity) => omit(['id', 'createdAt'])(item) as ProviderProfit;

interface ProviderProfitConfigTableRowProps {
  item: ProviderProfitEntity;
  saveItem: (item: ProviderProfit) => Promise<any>;
  deleteItem: (id: string) => Promise<any>;
  isAddMode?: boolean;
  isSpecific?: boolean;
}

export default ProviderProfitConfigTableRow;
