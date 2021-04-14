import React from 'react';
import { TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';

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
  return (
    <Autocomplete
      style={{ maxWidth: 300 }}
      multiple
      freeSolo
      options={data}
      value={selectedEmails}
      onChange={(_, newValue) => {
        //console.log(newValue);
        //todo email validation
        setSelectedEmails(newValue);
      }}
      renderInput={params => <TextField {...params} label={label} placeholder="Add email" variant="outlined" />}
    />
  );
};

export default MultipleEmailInput;
