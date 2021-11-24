import React, { ChangeEvent } from 'react';
import { Autocomplete } from '@material-ui/lab';
import { TextField } from '@material-ui/core';
import FitContentPopper from '../FitContentPopper';
import { Controller, useFormContext } from 'react-hook-form';

interface Props {
  value?: string | null;
  inputValue?: string | undefined;
  onChange: (location: string | null) => void;
  onInputChange?: (event: object, value: string, reason: string) => void;
  onBlur?: () => void;
  locations?: string[];
  loading?: boolean;
  label?: string;
  noOptionsText?: string;
  name?: string;
}

const LandLocationInput: React.FC<Props> = ({
  loading,
  value,
  inputValue,
  locations,
  onChange,
  onInputChange,
  onBlur,
  label = 'locations',
  noOptionsText = 'No options',
}) => {
  return (
    <Autocomplete
      fullWidth
      loading={loading}
      id={`transport-locations-input-${label}`}
      noOptionsText={noOptionsText}
      options={locations || []}
      onChange={(_: ChangeEvent<{}>, location: string | null) => onChange(location)}
      onInputChange={onInputChange}
      onBlur={onBlur}
      value={value || null}
      inputValue={inputValue}
      getOptionLabel={option => option}
      renderInput={params => <TextField {...params} fullWidth label={label} variant="outlined" />}
      PopperComponent={FitContentPopper}
    />
  );
};

interface ControlledProps extends Omit<Props, 'onChange' | 'value' | 'onBlur'> {
  name: string;
}

const ControlledLandLocationInput: React.FC<ControlledProps> = ({
  loading,
  label,
  noOptionsText,
  locations,
  name,
  inputValue,
  onInputChange,
}) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <LandLocationInput
          label={label}
          loading={loading}
          noOptionsText={noOptionsText}
          locations={locations}
          onChange={onChange}
          onBlur={onBlur}
          value={value}
          inputValue={inputValue}
          onInputChange={onInputChange}
        />
      )}
    />
  );
};

export { LandLocationInput, ControlledLandLocationInput };
