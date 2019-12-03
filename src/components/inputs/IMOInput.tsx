import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import InputProps from '../../model/InputProps';
import IMO from '../../model/IMO';
import { Box, TextField } from '@material-ui/core';

interface Props extends InputProps<IMO> {}

const focusAndSelect = (input: HTMLInputElement) => {
  input.focus();
  input.setSelectionRange(0, input.value.length);
};

const IMOInput: React.FC<Props> = ({ value, onChange }, ref) => {
  const input = useRef<HTMLInputElement>();

  useImperativeHandle(ref, () => ({
    focus: () => {
      focusAndSelect(input.current!);
    },
  }));

  return (
    <Box>
      <TextField inputRef={input} label="IMO Class" variant="outlined" />
      <TextField label="UN Number" variant="outlined" />
      <TextField label="PG Number" variant="outlined" />
    </Box>
  );
};

export default forwardRef(IMOInput);
