import { ChecklistNames, ChecklistNamesPreview } from '../bookings/checklist/ChecklistItemModel';
import Chip from '@material-ui/core/Chip';
import { TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

export const customTextFieldStyles = makeStyles({
  customTextField: {
    '& .MuiAutocomplete-input': {
      width: '150px',
    },
    '& input::placeholder': {
      fontSize: '15px',
    },
  },
});

interface Props {
  value?: string[];
  onChange: (event: React.ChangeEvent<{}>, value: string | string[] | null) => void;
}

const MultipleChecklistInput: React.FC<Props> = ({ value = [], onChange }) => {
  const classes = customTextFieldStyles();

  return (
    <Autocomplete
      classes={{ root: classes.customTextField }}
      multiple
      freeSolo
      autoHighlight
      options={Object.entries(ChecklistNamesPreview).map(t => t[1]) || []}
      value={value
        ?.map(value => Object.entries(ChecklistNames).find(([, name]) => value === name)?.[0] || '')
        ?.map(val => Object.entries(ChecklistNamesPreview).find(([id]) => id === val)?.[1] || '')}
      getOptionSelected={(option, value) => option === value}
      onChange={(_, value) => {
        const v = value
          .map(val => Object.entries(ChecklistNamesPreview).find(([, name]) => name === val)?.[0])
          .map(val => ChecklistNames[val as keyof typeof ChecklistNames]);
        onChange(_, v);
      }}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => <Chip label={option} {...getTagProps({ index })} />)
      }
      renderInput={params => (
        <TextField {...params} label="Checklist" placeholder="Type to filter" variant="outlined" />
      )}
    />
  );
};

export default MultipleChecklistInput;
