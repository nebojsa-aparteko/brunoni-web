import { TaskDescription, TaskType } from '../../model/Task';
import Chip from '@material-ui/core/Chip';
import { TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import React from 'react';
import { customTextFieldStyles } from './MultipleChecklistInput';

interface Props {
  value?: string[];
  onChange: (event: React.ChangeEvent<{}>, value: string | string[] | null) => void;
}

const MultipleTaskTypeInput: React.FC<Props> = ({ value = [], onChange }) => {
  const classes = customTextFieldStyles();

  return (
    <Autocomplete
      classes={{ root: classes.customTextField }}
      multiple
      freeSolo
      autoHighlight
      options={Object.entries(TaskDescription).map(t => t[1]) || []}
      value={value
        ?.map(value => Object.entries(TaskType).find(([, name]) => value === name)?.[0] || '')
        ?.map(val => Object.entries(TaskDescription).find(([id]) => id === val)?.[1] || '')}
      getOptionSelected={(option, value) => option === value}
      onChange={(_, value) => {
        const v = value
          .map(val => Object.entries(TaskDescription).find(([, name]) => name === val)?.[0])
          .map(val => TaskType[val as keyof typeof TaskType]);
        onChange(_, v);
      }}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => <Chip label={option} {...getTagProps({ index })} />)
      }
      renderInput={params => (
        <TextField {...params} label="Task type" placeholder="Type to filter" variant="outlined" />
      )}
    />
  );
};

export default MultipleTaskTypeInput;
