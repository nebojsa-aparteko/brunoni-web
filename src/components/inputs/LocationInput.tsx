import React, { forwardRef, useContext, useImperativeHandle, useRef, useState } from 'react';
import InputProps from '../../model/InputProps';
import Locations from '../../contexts/PickupLocations';
import PickupLocation from '../../model/PickupLocation';
import SelectInput from './SelectInput';

interface Props extends InputProps<PickupLocation | undefined> {
  margin?: any;
}

const getLocationLabel = (location: PickupLocation | undefined) =>
  location ? `${location.name} - ${location.city} - ${location.countryCode}` : '';

const focusAndSelect = (input: HTMLInputElement) => {
  input.focus();
  input.setSelectionRange(0, input.value.length);
};

const LocationInput: React.FC<Props> = ({ value, onChange, margin }, ref) => {
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
      margin={margin}
      options={locations}
      getOptionLabel={getLocationLabel}
      open={open}
      setOpen={setOpen}
      value={value}
      onChange={(location: PickupLocation | undefined) => onChange(location)}
    />
  );
};

export default forwardRef(LocationInput);
