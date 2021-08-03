import React, { ChangeEvent } from 'react';
import { Autocomplete } from '@material-ui/lab';
import { TextField } from '@material-ui/core';
import FitContentPopper from '../FitContentPopper';

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
  locations?: string[];
  label?: string;
}

const LandLocationInput: React.FC<Props> = ({ locations = defaultLocations, onChange, label = 'locations' }) => {
  return (
    <Autocomplete
      fullWidth
      id={`transport-modes-input-${label}`}
      options={locations}
      onChange={(_: ChangeEvent<{}>, mode: string | null) => onChange(mode)}
      getOptionLabel={option => option}
      renderInput={params => <TextField {...params} fullWidth label={label} variant="outlined" />}
      PopperComponent={FitContentPopper}
    />
  );
};

export default LandLocationInput;
