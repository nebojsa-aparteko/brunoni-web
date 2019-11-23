import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import set from 'lodash/fp/set';
import { Box, Button } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import { InputProps } from '../../model/InputProps';

interface Props<T> extends InputProps<T[]> {
  listRef?: React.Ref<unknown>;
  addButtonRef?: React.Ref<unknown>;
  ItemInput: React.ComponentType<InputProps<T>>;
  defaultItemValue: T;
  value: T[];
  onChange: (value: T[]) => void;
}

function ListInput<T>({ listRef, addButtonRef, ItemInput, defaultItemValue, value, onChange }: Props<T>) {
  const refs = useRef<unknown[]>([]);

  useImperativeHandle(listRef, () => ({
    focus: (i: number) => {
      if (refs.current.length > i) {
        const ref = refs.current[i] as { focus?: () => void };
        if (ref.focus) {
          ref.focus();
        }
      }
    },
  }));

  const handleAdd = () => {
    onChange([...value, defaultItemValue]);
    setTimeout(() => {
      (refs.current[refs.current.length - 1] as { focus: () => void }).focus();
    });
  };

  return (
    <Box>
      {value.map((item, i) => (
        <Box key={i} display="flex" mb={2}>
          <Box flex="1">
            <ItemInput ref={ref => (refs.current[i] = ref)} value={item} onChange={v => onChange(set(i, v)(value))} />
          </Box>
          <Box ml={2} alignSelf="center">
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
      <Button buttonRef={addButtonRef} variant="contained" size="small" startIcon={<AddIcon />} onClick={handleAdd}>
        Add
      </Button>
    </Box>
  );
}

export default ListInput;
