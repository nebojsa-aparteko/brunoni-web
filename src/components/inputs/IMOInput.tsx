import React, {
  ChangeEvent,
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useRef,
} from 'react';
import set from 'lodash/fp/set';
import InputProps from '../../model/InputProps';
import IMO from '../../model/IMO';
import { Box, makeStyles, TextField, Theme } from '@material-ui/core';

interface Props extends InputProps<IMO> {}

export const inlineFormStyles = makeStyles((theme: Theme) => ({
  formControl: {
    '& > *': {
      flex: 1,
    },
    '& > * + *': {
      marginLeft: theme.spacing(2),
    },
    [theme.breakpoints.down('md')]: {
      flexDirection: 'column',

      '& > * + *': {
        marginLeft: theme.spacing(0),
      },
    },
  },
}));

const focusAndSelect = (input: HTMLInputElement) => {
  input.focus();
  input.setSelectionRange(0, input.value.length);
};

const IMOInput: ForwardRefRenderFunction<any, Props> = ({ value, onChange }, ref) => {
  const classes = inlineFormStyles();
  const input = useRef<HTMLInputElement>();

  useImperativeHandle(ref, () => ({
    focus: () => {
      focusAndSelect(input.current!);
    },
  }));

  const handleIMOClassChange = (e: ChangeEvent<HTMLInputElement>) =>
    onChange(set('IMOClass', e.target.value)(value));
  const handleUNNumberChange = (e: ChangeEvent<HTMLInputElement>) =>
    onChange(set('UNNumber', e.target.value)(value));
  const handlePGNumberChange = (e: ChangeEvent<HTMLInputElement>) =>
    onChange(set('PGNumber', e.target.value)(value));

  return (
    <Box display="flex" className={classes.formControl}>
      <TextField
        inputRef={input}
        label="IMO Class"
        margin="dense"
        variant="outlined"
        value={value.IMOClass}
        onChange={handleIMOClassChange}
      />
      <TextField
        label="UN Number"
        variant="outlined"
        value={value.UNNumber}
        onChange={handleUNNumberChange}
        margin="dense"
      />
      <TextField
        label="PG Number"
        variant="outlined"
        value={value.PGNumber}
        onChange={handlePGNumberChange}
        margin="dense"
      />
    </Box>
  );
};

export default forwardRef(IMOInput);
