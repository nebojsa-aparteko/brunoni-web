// filepath: /Users/urosd/Documents/coding/brunoni/oskar-web/src/components/inputs/OpportunityEquipmentGroupInput.tsx
import React from 'react';
import { Autocomplete } from '@material-ui/lab';
import { TextField, Chip } from '@material-ui/core';
import { OpportunityEquipmentGroup } from '../../model/OpportunityEquipmentGroup';

interface Props {
  label: string;
  options: OpportunityEquipmentGroup[];
  value: OpportunityEquipmentGroup[];
  onChange: (groups: OpportunityEquipmentGroup[] | null) => void;
  multiple?: boolean;
}

const OpportunityEquipmentGroupInput: React.FC<Props> = ({
  label,
  options,
  value,
  onChange,
  multiple = false,
}) => {
  return (
    <Autocomplete
      multiple={multiple}
      options={options}
      getOptionLabel={(option: OpportunityEquipmentGroup) => option.name}
      getOptionSelected={(option, value) => option.id === value.id}
      value={multiple ? value || [] : value?.[0] || null}
      onChange={(_, newValue) => {
        if (multiple) {
          onChange(newValue as OpportunityEquipmentGroup[]);
        } else {
          onChange(newValue ? [newValue as OpportunityEquipmentGroup] : null);
        }
      }}
      renderTags={(value: OpportunityEquipmentGroup[], getTagProps) =>
        value.map((option: OpportunityEquipmentGroup, index: number) => (
          <Chip variant="outlined" label={option.name} size="small" {...getTagProps({ index })} />
        ))
      }
      renderInput={params => (
        <TextField {...params} label={label} variant="outlined" size="small" fullWidth />
      )}
    />
  );
};

export default OpportunityEquipmentGroupInput;
