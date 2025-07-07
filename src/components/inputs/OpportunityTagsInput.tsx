// filepath: /Users/urosd/Documents/coding/brunoni/oskar-web/src/components/inputs/OpportunityTagInput.tsx
import React from 'react';
import { Autocomplete } from '@material-ui/lab';
import { TextField, Chip } from '@material-ui/core';
import { OpportunityTag } from '../../model/OpportunityTag';

interface Props {
  label: string;
  options: OpportunityTag[];
  value: OpportunityTag[];
  onChange: (tags: OpportunityTag[] | null) => void;
  multiple?: boolean;
}

const OpportunityTagInput: React.FC<Props> = ({
  label,
  options,
  value,
  onChange,
  multiple = true,
}) => {
  return (
    <Autocomplete
      multiple={multiple}
      options={options}
      getOptionLabel={(option: OpportunityTag) => option.tag}
      getOptionSelected={(option, value) => option.id === value.id}
      value={value || []}
      onChange={(_, newValue) => onChange(newValue as OpportunityTag[])}
      renderTags={(value: OpportunityTag[], getTagProps) =>
        value.map((option: OpportunityTag, index: number) => (
          <Chip
            variant="outlined"
            label={option.tag}
            size="small"
            {...getTagProps({ index })}
            key={option.id}
          />
        ))
      }
      renderInput={params => (
        <TextField {...params} label={label} variant="outlined" size="small" fullWidth />
      )}
    />
  );
};

export default OpportunityTagInput;
