import React, { ChangeEvent, forwardRef, ForwardRefRenderFunction, useImperativeHandle, useRef } from 'react';
import set from 'lodash/fp/set';
import InputProps from '../../model/InputProps';
import OOG from '../../model/OOG';
import { Box, TextField } from '@material-ui/core';
import { inlineFormStyles } from './IMOInput';

interface Props extends InputProps<OOG> {}

const focusAndSelect = (input: HTMLInputElement) => {
  input.focus();
  input.setSelectionRange(0, input.value.length);
};

const OOGInput: ForwardRefRenderFunction<any, Props> = ({ value, onChange }, ref) => {
  const classes = inlineFormStyles();
  const input = useRef();

  useImperativeHandle(ref, () => ({
    focus: () => {
      focusAndSelect(input.current!);
    },
  }));

  const handleWidthChange = (e: ChangeEvent<HTMLInputElement>) => onChange(set('width', e.target.value)(value));
  const handleHeightChange = (e: ChangeEvent<HTMLInputElement>) => onChange(set('height', e.target.value)(value));
  const handleLengthChange = (e: ChangeEvent<HTMLInputElement>) => onChange(set('length', e.target.value)(value));
  const handleWeightChange = (e: ChangeEvent<HTMLInputElement>) => onChange(set('weight', e.target.value)(value));

  return (
    <Box display="flex" className={classes.formControl}>
      <TextField
        label="Length [cm]"
        variant="outlined"
        value={value.length}
        onChange={handleLengthChange}
        margin="dense"
      />
      <TextField
        inputRef={input}
        label="Width [cm]"
        margin="dense"
        variant="outlined"
        value={value.width}
        onChange={handleWidthChange}
      />
      <TextField
        label="Height [cm]"
        variant="outlined"
        value={value.height}
        onChange={handleHeightChange}
        margin="dense"
      />
      <TextField
        label="Weight [kg]"
        variant="outlined"
        value={value.weight}
        onChange={handleWeightChange}
        margin="dense"
      />
    </Box>
  );
};

export default forwardRef(OOGInput);
