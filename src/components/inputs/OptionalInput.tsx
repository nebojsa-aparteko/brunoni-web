import React, { useImperativeHandle, useRef } from 'react';
import { Box, Checkbox, FormControlLabel } from '@material-ui/core';

export interface OptionalInputProps<T> {
  ref?: React.Ref<unknown>;
  value: T;
  onChange: (value: T) => void;
}

interface Props<T> {
  ref?: React.Ref<unknown>;
  label: string;
  itemRef?: React.Ref<unknown>;
  ItemInput: React.ComponentType<OptionalInputProps<T>>;
  defaultItemValue: T;
  value: [false] | [true, T];
  onChange: (value: [false] | [true, T]) => void;
}

function OptionalInput<T>({
  label,
  itemRef,
  ItemInput,
  defaultItemValue,
  value,
  onChange,
}: Props<T>) {
  const ref = useRef();

  useImperativeHandle(itemRef, () => ({
    focus: () => {
      if (ref.current) {
        const r = (ref.current || {}) as unknown as { focus?: () => void };

        if (r.focus) {
          r.focus();
        }
      }
    },
  }));

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    onChange(checked ? [true, defaultItemValue] : [false]);
  };

  const handleItemChange = (v: T) => onChange([true, v]);

  return (
    <Box>
      <FormControlLabel
        control={<Checkbox checked={value && value[0]} onChange={handleChange} />}
        label={label}
      />
      {value[0] && (
        <Box>
          <ItemInput ref={ref} value={value[1]} onChange={handleItemChange} />
        </Box>
      )}
    </Box>
  );
}

export default OptionalInput;
