import React from 'react';
import { Autocomplete } from '@material-ui/lab';
import { TextField } from '@material-ui/core';
import { OpportunityPlacesGroup } from '../../model/OpportunityPlacesGroup';

interface Props {
  label: string;
  options: OpportunityPlacesGroup[];
  value?: OpportunityPlacesGroup | null;
  onChange: (group: OpportunityPlacesGroup | null) => void;
}

const OpportunityPlacesGroupInput: React.FC<Props> = ({ label, options, value, onChange }) => {
  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option: OpportunityPlacesGroup) => option.name}
      getOptionSelected={(option, value) => option.id === value.id}
      value={value || null}
      onChange={(_, newValue) => onChange(newValue)}
      renderInput={params => (
        <TextField {...params} label={label} variant="outlined" size="small" fullWidth />
      )}
    />
  );
};

export default OpportunityPlacesGroupInput;
