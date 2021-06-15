import { TextField, Typography } from '@material-ui/core';
import React from 'react';
import { TextFieldProps } from '@material-ui/core/TextField/TextField';

const EditingInput: React.FC<EditingInputProps> = ({ editing, inputProps, value }) =>
  editing ? (
    <TextField margin="dense" variant="outlined" fullWidth value={value} {...inputProps} />
  ) : (
    <Typography> {value || '[To be assigned]'}</Typography>
  );
export default EditingInput;

interface EditingInputProps {
  editing: boolean;
  inputProps?: TextFieldProps;
  value?: string;
}
