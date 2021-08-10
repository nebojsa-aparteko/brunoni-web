import React, { ChangeEvent } from 'react';
import { Autocomplete } from '@material-ui/lab';
import { TextField } from '@material-ui/core';
import FitContentPopper from '../FitContentPopper';
import { Controller, useFormContext } from 'react-hook-form';

const defaultTransportModes = ['Barge', 'Barge + Truck', 'Rail + Barge', 'Rail + Truck'];

interface Props {
  value?: string | null;
  onChange: (transportMode: string | null) => void;
  onBlur?: () => void;
  transportModes?: string[];
  label?: string;
}

const TransportModeInput: React.FC<Props> = ({
  transportModes = defaultTransportModes,
  value,
  onChange,
  onBlur,
  label = 'Transport mode',
}) => {
  return (
    <Autocomplete
      fullWidth
      id="transport-modes-input"
      options={transportModes}
      value={value || null}
      onChange={(_: ChangeEvent<{}>, mode: string | null) => onChange(mode)}
      onBlur={onBlur}
      getOptionLabel={option => option}
      renderInput={params => <TextField {...params} label={label} fullWidth variant="outlined" />}
      PopperComponent={FitContentPopper}
    />
  );
};

interface ControlledProps extends Omit<Props, 'onChange' | 'value' | 'onBlur'> {
  name: string;
}

export const ControlledTransportModeInput: React.FC<ControlledProps> = ({ label, transportModes, name }) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <TransportModeInput
          label={label}
          transportModes={transportModes}
          onChange={onChange}
          onBlur={onBlur}
          value={value}
        />
      )}
    />
  );
};

export default TransportModeInput;
