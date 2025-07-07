import React from 'react';
import { Autocomplete } from '@material-ui/lab';
import { TextField, Chip } from '@material-ui/core';
import { OpportunityCommodityGroup } from '../../model/OpportunityCommodityGroup';

interface Props {
  label: string;
  options: OpportunityCommodityGroup[];
  value: OpportunityCommodityGroup[];
  onChange: (groups: OpportunityCommodityGroup[] | null) => void;
  multiple?: boolean;
}

const OpportunityCommodityGroupInput: React.FC<Props> = ({
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
      getOptionLabel={(option: OpportunityCommodityGroup) => option.name}
      getOptionSelected={(option, value) => option.id === value.id}
      value={multiple ? value || [] : value?.[0] || null}
      onChange={(_, newValue) => {
        if (multiple) {
          onChange(newValue as OpportunityCommodityGroup[]);
        } else {
          onChange(newValue ? [newValue as OpportunityCommodityGroup] : null);
        }
      }}
      renderTags={(value: OpportunityCommodityGroup[], getTagProps) =>
        value.map((option: OpportunityCommodityGroup, index: number) => (
          <Chip variant="outlined" label={option.name} size="small" {...getTagProps({ index })} />
        ))
      }
      renderInput={params => (
        <TextField {...params} label={label} variant="outlined" size="small" fullWidth />
      )}
    />
  );
};

export default OpportunityCommodityGroupInput;
