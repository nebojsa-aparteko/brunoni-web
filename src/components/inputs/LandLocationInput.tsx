import React, { ChangeEvent } from 'react';
import { Autocomplete } from '@material-ui/lab';
import { TextField } from '@material-ui/core';
import FitContentPopper from '../FitContentPopper';
import { Controller, useFormContext } from 'react-hook-form';

const defaultLocations = [
  'ALTHOFEN',
  'SANKT JAKOB (VOLKERMARKT)',
  'SANKT STEFAN (KARNTEN)',
  'ALTENMARKT',
  'BAD ERLACH',
  'HAAG',
  'SCHREMS',
  'WEISSENBACH',
  'LAMBACH',
  'SANKT AGATHA',
  'SANKT PANTALEON',
  'RAMSAU',
  'UTTENDORF',
  'RIEGERSDORF',
];

interface Props {
  value?: string | null;
  onChange: (location: string | null) => void;
  onBlur?: () => void;
  locations?: string[];
  label?: string;
  name?: string;
}

const LandLocationInput: React.FC<Props> = ({
  value,
  locations = defaultLocations,
  onChange,
  onBlur,
  label = 'locations',
}) => {
  return (
    <Autocomplete
      fullWidth
      id={`transport-modes-input-${label}`}
      options={locations}
      onChange={(_: ChangeEvent<{}>, mode: string | null) => onChange(mode)}
      onBlur={onBlur}
      value={value || null}
      getOptionLabel={option => option}
      renderInput={params => <TextField {...params} fullWidth label={label} variant="outlined" />}
      PopperComponent={FitContentPopper}
    />
  );
};

interface ControlledProps extends Omit<Props, 'onChange' | 'value' | 'onBlur'> {
  name: string;
}

const ControlledLandLocationInput: React.FC<ControlledProps> = ({ label, locations, name }) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <LandLocationInput label={label} locations={locations} onChange={onChange} onBlur={onBlur} value={value} />
      )}
    />
  );
};

export { LandLocationInput, ControlledLandLocationInput };
