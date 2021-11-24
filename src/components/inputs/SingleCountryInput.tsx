import React, { forwardRef, ForwardRefRenderFunction, useImperativeHandle, useRef, useState } from 'react';
import SelectInput from './SelectInput';
import InputProps from '../../model/InputProps';
import useCountries from '../../hooks/useCountries';
import Country from '../../model/Country';

interface Props extends InputProps<Country> {
  margin?: any;
}

const focusAndSelect = (input: HTMLInputElement) => {
  input.focus();
  input.setSelectionRange(0, input.value.length);
};

const filterOptions = (options: Country[], { inputValue }: { inputValue: string }) => {
  return options.filter(option => option.name.toLowerCase().includes(inputValue.trim().toLowerCase()));
};

const CountryInput: ForwardRefRenderFunction<any, Props> = ({ value, onChange, margin }, ref) => {
  const input = useRef();
  const [open, setOpen] = useState(false);
  const countries = useCountries();

  useImperativeHandle(ref, () => ({
    focus: () => {
      focusAndSelect(input.current!);
    },
  }));

  return (
    <SelectInput
      inputRef={input}
      label="Country"
      margin={margin}
      options={countries || []}
      getOptionLabel={value => value.name}
      filterOptions={filterOptions}
      open={open}
      setOpen={setOpen}
      value={value}
      onChange={(country: Country | null) => onChange(country)}
      getOptionSelected={(option: Country, value: Country) => option.countryCode === value.countryCode}
    />
  );
};

export default forwardRef(CountryInput);
