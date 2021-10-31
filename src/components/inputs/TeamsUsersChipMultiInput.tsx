/* eslint-disable no-use-before-define */
import React from 'react';
import Chip from '@material-ui/core/Chip';
import Autocomplete from '@material-ui/lab/Autocomplete';
import UserRecord from '../../model/UserRecord';
import { makeStyles, TextField } from '@material-ui/core';
import useAdminUsers from '../../hooks/useAdminUsers';

const useStyles = makeStyles({
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
  value?: UserRecord[];
  onChange: (event: React.ChangeEvent<{}>, value: UserRecord | UserRecord[] | null) => void;
}

const TeamsUsersChipMultiInput: React.FC<Props> = ({ value = [], onChange }) => {
  const adminUsers = useAdminUsers();
  const classes = useStyles();
  return (
    <Autocomplete
      classes={{ root: classes.customTextField }}
      multiple
      autoHighlight
      options={adminUsers}
      getOptionSelected={(option, value) => option.alphacomId === value.alphacomId}
      getOptionLabel={option => `${option.firstName} ${option.lastName}`}
      value={value}
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
