import { Checkbox, FormControlLabel } from '@material-ui/core';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

interface Props {
  value: boolean;
  onChange: (v: boolean) => void;
  onBlur?: () => void;
  label?: string;
}

const CheckBox: React.FC<Props> = ({ value, onChange, onBlur, label }) => {
  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={value || false}
          onChange={event => onChange(event.target.checked)}
          onBlur={onBlur}
          color="primary"
        />
      }
      label={label}
    />
  );
};

interface ControlledProps extends Omit<Props, 'onChange' | 'value' | 'onBlur'> {
  name: string;
}

export const ControlledCheckBox: React.FC<ControlledProps> = ({ name, label }) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <CheckBox label={label} onChange={onChange} onBlur={onBlur} value={value} />
      )}
    />
  );
};

export default CheckBox;
