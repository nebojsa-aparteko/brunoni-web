import React from 'react';
import { TextFieldProps, TextField } from '@material-ui/core';
import { FieldError } from 'react-hook-form';

const FormTextField: React.FC<FormTextFieldProps> = ({ formError, ...props }) => (
  <TextField {...props} error={!!formError} helperText={formError ? formError.message : null} />
);
interface FormProps {
  formError?: FieldError;
}

type FormTextFieldProps = FormProps & TextFieldProps;

export const defaultValidationRules = { required: 'This field is required.' };
export default FormTextField;
