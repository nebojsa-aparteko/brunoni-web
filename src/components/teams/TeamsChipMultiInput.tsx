/* eslint-disable no-use-before-define */
import React from 'react';
import Chip from '@material-ui/core/Chip';
import Autocomplete from '@material-ui/lab/Autocomplete';
import UserRecord from '../../model/UserRecord';
import { Input, TextField } from '@material-ui/core';

interface Props {
  options: UserRecord[];
  values?: UserRecord[];
}

const TeamsChipMultiInput: React.FC<Props> = ({ options, values }) => {
  return (
    <Autocomplete
      multiple
      options={options}
      getOptionLabel={option => `${option.firstName} ${option.lastName}`}
      defaultValue={values}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip label={`${option.firstName} ${option.lastName}`} {...getTagProps({ index })} />
        ))
      }
      renderInput={params => <TextField {...params} label="Teams" placeholder="Type to filter" variant="outlined" />}
    />
  );
};

export default TeamsChipMultiInput;
