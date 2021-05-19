import React from 'react';
import { makeStyles, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

const useStyles = makeStyles({
  customTextField: {
    '& .MuiAutocomplete-input': {
      width: '150px',
    },
    '& input::placeholder': {
      fontSize: '15px',
    },
  },
  input: {
    width: '300px',
  },
});

interface MultipleEmailInputInterface {
  data: string[];
  label?: string;
  setSelectedEmails: (emails: string[]) => void;
  selectedEmails?: string[];
}
// TODO - Add email validation
const MultipleEmailInput: React.FC<MultipleEmailInputInterface> = ({
  data,
  label = '',
  setSelectedEmails,
  selectedEmails = [],
}) => {
  const classes = useStyles();
  return (
    <Autocomplete
      classes={{ root: classes.customTextField }}
      multiple
      freeSolo
      options={data}
      value={selectedEmails}
      onChange={(_, newValue) => {
        //todo email validation
        setSelectedEmails(newValue);
      }}
      renderInput={params => (
        <TextField {...params} label={label} placeholder="Add email & press &#9166;" variant="outlined" />
      )}
    />
  );
};

export default MultipleEmailInput;
