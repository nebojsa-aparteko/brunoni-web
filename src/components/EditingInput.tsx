import { TextField, Typography } from '@material-ui/core';
import React from 'react';
import { TextFieldProps } from '@material-ui/core/TextField/TextField';
import { TypographyProps } from '@material-ui/core/Typography';

const EditingInput: React.FC<EditingInputProps> = ({
  editing,
  inputProps,
  value,
  canEdit = true,
  typographyProps = {},
  noDefaultLabel = false,
  renderValue = value => value,
}) =>
  editing && canEdit ? (
    <TextField
      margin="dense"
      variant="outlined"
      fullWidth
      value={value}
      {...inputProps}
      onClick={event => {
        event.preventDefault();
        event.stopPropagation();
      }}
    />
  ) : (
    <Typography {...typographyProps}>
      {' '}
      {renderValue(value) || (noDefaultLabel ? '' : '[To be assigned]')}
    </Typography>
  );
export default EditingInput;

interface EditingInputProps {
  editing: boolean;
  inputProps?: TextFieldProps;
  typographyProps?: TypographyProps;
  value?: string | number;
  canEdit?: boolean;
  noDefaultLabel?: boolean;
  renderValue?: (value: any) => string;
}
