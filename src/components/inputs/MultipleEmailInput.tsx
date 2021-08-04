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
