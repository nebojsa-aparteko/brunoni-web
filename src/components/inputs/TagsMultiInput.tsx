import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

interface TagsMultiInputProps {
  data: string[];
  label?: string;
  selectedTags?: string[];
  onChange?: (tags: string[]) => void;
}

const useStyles = makeStyles({
  customTextField: {
    '& .MuiAutocomplete-input': {
      width: '200px',
    },
    '& input::placeholder': {
      fontSize: '15px',
    },
  },
  input: {
    width: '100%',
  },
});

const TagsMultiInput: React.FC<TagsMultiInputProps> = ({
  data,
  label = 'Tags',
  selectedTags = [],
  onChange,
}) => {
  const classes = useStyles();

  return (
    <Autocomplete
      classes={{ root: classes.customTextField }}
      multiple
      freeSolo
      options={data}
      value={selectedTags}
      onChange={(_, newValue) => {
        onChange?.(newValue);
      }}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          placeholder="Add tag and press Enter &#9166;"
          variant="outlined"
          fullWidth
        />
      )}
    />
  );
};

export default TagsMultiInput;
