import React, { forwardRef, useContext, useImperativeHandle, useRef, useState } from 'react';
import { InputProps } from '../../model/InputProps';
import Locations from '../../contexts/Locations';
import { Location } from '../../model/get-quotes/Location';
import SelectInput from './SelectInput';

interface Props extends InputProps<Location | undefined> {}

const getLocationLabel = (location: Location | undefined) =>
  location ? `${location.AdrName} - ${location.AdrCity} - ${location.AdrISOCountry}` : '';

const focusAndSelect = (input: HTMLInputElement) => {
  input.focus();
  input.setSelectionRange(0, input.value.length);
};

const LocationInput: React.FC<Props> = ({ value, onChange }, ref) => {
  const input = useRef();
  const locations = useContext(Locations);
  const [open, setOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    focus: () => {
      focusAndSelect(input.current!);
    },
  }));

  return (
    <SelectInput
      inputRef={input}
      label="Pickup/Dropoff Location in EUROPE"
      options={locations}
      getOptionLabel={getLocationLabel}
      open={open}
      setOpen={setOpen}
      value={value}
      onChange={(location: Location | undefined) => onChange(location)}
    />
  );
};

export default forwardRef(LocationInput);
