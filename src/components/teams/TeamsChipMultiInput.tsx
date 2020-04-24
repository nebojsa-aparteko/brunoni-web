/* eslint-disable no-use-before-define */
import React from 'react';
import Chip from '@material-ui/core/Chip';
import Autocomplete from '@material-ui/lab/Autocomplete';
import UserRecord from '../../model/UserRecord';
import { Input } from '@material-ui/core';

interface Props {
  options: UserRecord[];
  values?: UserRecord[];
}

const TeamsChipMultiInput: React.FC<Props> = ({ options, values }) => {
  return (
    <Autocomplete
      multiple
      id="fixed-tags-demo"
      options={options}
      getOptionLabel={option => `${option.firstName} ${option.lastName}`}
      defaultValue={values}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip label={`${option.firstName} ${option.lastName}`} {...getTagProps({ index })} />
        ))
      }
      style={{ width: 500 }}
      renderInput={params => (
        <Input placeholder="Type to filter" inputProps={{ 'aria-label': 'description' }} {...params} />
      )}
    />
  );
};

export default TeamsChipMultiInput;
