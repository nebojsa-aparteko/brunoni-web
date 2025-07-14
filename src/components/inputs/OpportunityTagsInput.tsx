// filepath: /Users/urosd/Documents/coding/brunoni/oskar-web/src/components/inputs/OpportunityTagInput.tsx
import React, { useState } from 'react';
import { Autocomplete } from '@material-ui/lab';
import { TextField, Chip } from '@material-ui/core';
import { OpportunityTag } from '../../model/OpportunityTag';
import asArray from '../../utilities/asArray';

interface Props {
  label: string;
  options: OpportunityTag[];
  value: OpportunityTag[];
  defaultValues?: OpportunityTag[];
  onChange: (event: React.ChangeEvent<{}>, value: OpportunityTag | OpportunityTag[] | null) => void;
  multiple?: boolean;
}

const OpportunityTagInput: React.FC<Props> = ({
  label,
  options,
  value,
  onChange,
  multiple = true,
  defaultValues,
}) => {
  const [disableInput, setDisableInput] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<OpportunityTag[]>([]);
  const handleChange = (
    event: React.ChangeEvent<{}>,
    tags: OpportunityTag | OpportunityTag[] | null,
  ) => {
    setDisableInput(asArray(tags).length >= 10);
    onChange(event, tags);
    setSelectedTags(asArray(tags));
  };
  return (
    <Autocomplete
      multiple
      autoHighlight
      options={options}
      getOptionSelected={(option, value) => option.id === value.id}
      getOptionDisabled={option => disableInput && !selectedTags.some(tag => tag.id === option.id)}
      getOptionLabel={option => `${option.tag}`}
      defaultValue={defaultValues}
      onChange={handleChange}
      renderTags={value => value.map(option => <Chip key={option.id} label={option.tag} />)}
      renderOption={option => <Chip key={option.id} label={option.tag} />}
      renderInput={params => (
        <TextField {...params} label="Tags" placeholder="Type to filter" variant="outlined" />
      )}
    />
  );
};

export default OpportunityTagInput;
