import React, { ChangeEvent, forwardRef, useImperativeHandle, useRef } from 'react';
import set from 'lodash/fp/set';
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

  const handleWidthChange = (e: ChangeEvent<HTMLInputElement>) => onChange(set('width', e.target.value)(value));
  const handleHeightChange = (e: ChangeEvent<HTMLInputElement>) => onChange(set('height', e.target.value)(value));
  const handleLengthChange = (e: ChangeEvent<HTMLInputElement>) => onChange(set('length', e.target.value)(value));
  const handleWeightChange = (e: ChangeEvent<HTMLInputElement>) => onChange(set('weight', e.target.value)(value));

  return (
    <Box>
      <TextField
        inputRef={input}
        label="Width [cm]"
        variant="outlined"
        value={value.width}
        onChange={handleWidthChange}
      />
      <TextField label="Height [cm]" variant="outlined" value={value.height} onChange={handleHeightChange} />
      <TextField label="Length [cm]" variant="outlined" value={value.length} onChange={handleLengthChange} />
      <TextField label="Weight [kg]" variant="outlined" value={value.weight} onChange={handleWeightChange} />
    </Box>
  );
};

export default forwardRef(OOGInput);
