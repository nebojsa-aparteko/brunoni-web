import React from 'react';
import Chip from '@material-ui/core/Chip';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { TextField } from '@material-ui/core';
import { Team } from '../../model/Teams';

interface Props {
  options: Team[];
  values?: Team[];
  onChange: (event: React.ChangeEvent<{}>, value: Team | Team[] | null) => void;
}

const TeamsTeamsChipMultiInput: React.FC<Props> = ({ options, values, onChange }) => {
  return (
    <Autocomplete
      multiple
      options={options}
      getOptionLabel={option => `${option.name}`}
      defaultValue={values}
      onChange={onChange}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => <Chip label={`${option.name}`} {...getTagProps({ index })} />)
      }
      renderInput={params => <TextField {...params} label="Teams" placeholder="Type to filter" variant="outlined" />}
    />
  );
};

export default TeamsTeamsChipMultiInput;
