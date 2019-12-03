import React, { ChangeEvent, forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import set from 'lodash/fp/set';
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

  const handleIMOClassChange = (e: ChangeEvent<HTMLInputElement>) => onChange(set('IMOClass', e.target.value)(value));
  const handleUNNumberChange = (e: ChangeEvent<HTMLInputElement>) => onChange(set('UNNumber', e.target.value)(value));
  const handlePGNumberChange = (e: ChangeEvent<HTMLInputElement>) => onChange(set('PGNumber', e.target.value)(value));

  return (
    <Box>
      <TextField
        inputRef={input}
        label="IMO Class"
        variant="outlined"
        value={value.IMOClass}
        onChange={handleIMOClassChange}
      />
      <TextField label="UN Number" variant="outlined" value={value.UNNumber} onChange={handleUNNumberChange} />
      <TextField label="PG Number" variant="outlined" value={value.PGNumber} onChange={handlePGNumberChange} />
    </Box>
  );
};

export default forwardRef(IMOInput);
