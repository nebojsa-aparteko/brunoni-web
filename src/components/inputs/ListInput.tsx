import React from 'react';
import set from 'lodash/fp/set';
import { Box, Button } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import { InputProps } from '../../model/InputProps';

interface Props<T> extends InputProps<T[]> {
  ItemInput: React.ComponentType<InputProps<T>>;
  defaultItemValue: T;
  value: T[];
  onChange: (value: T[]) => void;
}

function ListInput<T>({ ItemInput, defaultItemValue, value, onChange }: Props<T>) {
  return (
    <Box>
      {value.map((item, i) => (
        <Box key={i} display="flex" mb={2}>
          <Box flex="1">
            <ItemInput value={item} onChange={v => onChange(set(i, v)(value))} />
          </Box>
          <Box>
            <Button
              variant="contained"
              size="small"
              startIcon={<RemoveIcon />}
              onClick={() => {
                const v = [...value];
                v.splice(i, 1);
                onChange(v);
              }}
            >
              Remove
            </Button>
          </Box>
        </Box>
      ))}
      <Button
        variant="contained"
        size="small"
        startIcon={<AddIcon />}
        onClick={() => onChange([...value, defaultItemValue])}
      >
        Add
      </Button>
    </Box>
  );
}

export default ListInput;
