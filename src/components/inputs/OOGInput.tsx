import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import InputProps from '../../model/InputProps';
import OOG from '../../model/OOG';
import { Box, TextField } from '@material-ui/core';

interface Props extends InputProps<OOG> {}

const focusAndSelect = (input: HTMLInputElement) => {
  input.focus();
  input.setSelectionRange(0, input.value.length);
};

const OOGInput: React.FC<Props> = ({ value, onChange }, ref) => {
  const input = useRef();

  useImperativeHandle(ref, () => ({
    focus: () => {
      focusAndSelect(input.current!);
    },
  }));

  return (
    <Box>
      <TextField inputRef={input} label="Width [cm]" variant="outlined" />
      <TextField label="Height [cm]" variant="outlined" />
      <TextField label="Length [cm]" variant="outlined" />
      <TextField label="Weight [kg]" variant="outlined" />
    </Box>
  );
};

export default forwardRef(OOGInput);
