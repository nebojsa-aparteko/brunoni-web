import React from 'react';
import { Autocomplete } from '@material-ui/lab';
import { TextField } from '@material-ui/core';
import { OpportunityPortsGroup } from '../../model/OpportunityPortsGroup';

interface Props {
  label: string;
  options: OpportunityPortsGroup[];
  value?: OpportunityPortsGroup | null;
  onChange: (group: OpportunityPortsGroup | null) => void;
}

const OpportunityPortsGroupInput: React.FC<Props> = ({ label, options, value, onChange }) => {
  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option: OpportunityPortsGroup) => option.name}
      getOptionSelected={(option, value) => option.id === value.id}
      value={value || null}
      onChange={(_, newValue) => onChange(newValue)}
      renderInput={params => (
        <TextField {...params} label={label} variant="outlined" size="small" fullWidth />
      )}
    />
  );
};

export default OpportunityPortsGroupInput;
