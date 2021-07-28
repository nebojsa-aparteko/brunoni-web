/* eslint-disable no-use-before-define */
import React from 'react';
import Chip from '@material-ui/core/Chip';
import Autocomplete from '@material-ui/lab/Autocomplete';
import UserRecord from '../../model/UserRecord';
import { TextField } from '@material-ui/core';

interface Props {
  options: UserRecord[];
  values?: UserRecord[];
  onChange: (event: React.ChangeEvent<{}>, value: UserRecord | UserRecord[] | null) => void;
}

const TeamsUsersChipMultiInput: React.FC<Props> = ({ options, values, onChange }) => {
  return (
    <Autocomplete
      multiple
      autoHighlight
      options={options}
      getOptionSelected={(option, value) => option.alphacomId === value.alphacomId}
      getOptionLabel={option => `${option.firstName} ${option.lastName}`}
      value={values || []}
      onChange={onChange}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip label={`${option.firstName} ${option.lastName}`} {...getTagProps({ index })} />
        ))
      }
      renderInput={params => <TextField {...params} label="Users" placeholder="Type to filter" variant="outlined" />}
    />
  );
};

export default TeamsUsersChipMultiInput;
