// filepath: /Users/urosd/Documents/coding/brunoni/oskar-web/src/components/inputs/OpportunityTagInput.tsx
import React, { useState } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField, Chip } from '@material-ui/core';
import { OpportunityTag } from '../../model/OpportunityTag';
import asArray from '../../utilities/asArray';

interface Props {
  options: OpportunityTag[];
  defaultValues?: OpportunityTag[];
  onChange: (event: React.ChangeEvent<{}>, value: OpportunityTag[] | null) => void;
}

const OpportunityTagsInput: React.FC<Props> = ({ options, defaultValues, onChange }) => {
  const [disableInput, setDisableInput] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<OpportunityTag[]>(defaultValues || []);

  const handleChange = (event: React.ChangeEvent<{}>, tags: OpportunityTag[] | null) => {
    const tagsArray = tags || [];
    setDisableInput(tagsArray.length >= 10);
    setSelectedTags(tagsArray);
    onChange(event, tagsArray);
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
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip key={option.id} label={option.tag} size="small" {...getTagProps({ index })} />
        ))
      }
      renderOption={option => <Chip key={option.id} label={option.tag} size="small" />}
      renderInput={params => (
        <TextField {...params} label="Tags" placeholder="Type to filter" variant="outlined" />
      )}
    />
  );
};

export default OpportunityTagsInput;
