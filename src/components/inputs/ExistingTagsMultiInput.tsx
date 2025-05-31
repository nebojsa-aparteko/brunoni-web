import React, { useState } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField } from '@material-ui/core';
import { Tag } from '../../model/Tag';
import { TagItem } from '../tags/TagsList';
import asArray from '../../utilities/asArray';

interface Props {
  options: Tag[];
  defaultValues?: Tag[];
  onChange: (event: React.ChangeEvent<{}>, value: Tag | Tag[] | null) => void;
}

const ExistingTagsMultiInput: React.FC<Props> = ({ options, defaultValues, onChange }) => {
  const [disableInput, setDisableInput] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const handleChange = (event: React.ChangeEvent<{}>, tags: Tag | Tag[] | null) => {
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
      getOptionLabel={option => `${option.text}`}
      defaultValue={defaultValues}
      onChange={handleChange}
      renderTags={value => value.map(option => <TagItem key={option.id} tag={option} />)}
      renderOption={option => <TagItem key={option.id} tag={option} />}
      renderInput={params => (
        <TextField {...params} label="Tags" placeholder="Type to filter" variant="outlined" />
      )}
    />
  );
};

export default ExistingTagsMultiInput;
