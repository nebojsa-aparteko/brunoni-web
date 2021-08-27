import React, { forwardRef, ForwardRefRenderFunction, useImperativeHandle, useRef, useState } from 'react';
import SelectInput from './SelectInput';
import InputProps from '../../model/InputProps';

interface Props extends InputProps<string> {
  margin?: any;
}

const focusAndSelect = (input: HTMLInputElement) => {
  input.focus();
  input.setSelectionRange(0, input.value.length);
};

const currencies = ['EUR', 'USD', 'CHF'];

const CurrencyInput: ForwardRefRenderFunction<any, Props> = ({ value, onChange, margin }, ref) => {
  const input = useRef();
  const [open, setOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    focus: () => {
      focusAndSelect(input.current!);
    },
  }));

  return (
    <SelectInput
      inputRef={input}
      label="Currency"
      margin={margin}
      options={currencies || []}
      getOptionLabel={value => value}
      open={open}
      setOpen={setOpen}
      value={value}
      onChange={(currency: string | null) => onChange(currency)}
      getOptionSelected={(option: string, value: string) => option === value}
    />
  );
};

export default forwardRef(CurrencyInput);
