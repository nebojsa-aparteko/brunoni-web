import { Team } from '../../model/Teams';
import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Chip from '@material-ui/core/Chip';
import { TextField } from '@material-ui/core';
import UserRecord from '../../model/UserRecord';

interface Props {
  options: UserRecord[];
  values?: UserRecord[];
  onChange: (event: React.ChangeEvent<{}>, value: UserRecord | UserRecord[] | null) => void;
}

const WatchersBookingMultiInput: React.FC<Props> = ({ options, values, onChange }) => {
  return (
    <Autocomplete
      multiple
      options={options}
      getOptionLabel={option => `${option.firstName} ${option.lastName}`}
      defaultValue={values}
      onChange={onChange}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip label={`${option.firstName} ${option.lastName}`} {...getTagProps({ index })} />
        ))
      }
      renderInput={params => <TextField {...params} label="Watchers" placeholder="Type to filter" variant="outlined" />}
    />
  );
};

export default WatchersBookingMultiInput;
