import React, { useMemo } from 'react';
import Chip from '@material-ui/core/Chip';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField } from '@material-ui/core';
import UserRecord from '../../model/UserRecord';

interface Props {
  options: UserRecord[];
  values?: UserRecord[];
  fixedValues: UserRecord[];
  onChange: (event: React.ChangeEvent<{}>, value: UserRecord | UserRecord[] | null) => void;
}

const WatchersChipMultiInput: React.FC<Props> = ({ options, values, fixedValues, onChange }) => {
  return (
    <Autocomplete
      multiple
      filterSelectedOptions={true}
      options={options}
      getOptionLabel={option => `${option.firstName} ${option.lastName}`}
      getOptionSelected={(option, value) => option.emailAddress === value.emailAddress}
      value={values}
      onChange={onChange}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            label={`${option.firstName} ${option.lastName}`}
            {...getTagProps({ index })}
            disabled={fixedValues.some(fixedValue => fixedValue?.alphacomId === option?.alphacomId)}
          />
        ))
      }
      renderInput={params => <TextField {...params} label="Watchers" placeholder="Type to filter" variant="outlined" />}
    />
  );
};

export default WatchersChipMultiInput;
