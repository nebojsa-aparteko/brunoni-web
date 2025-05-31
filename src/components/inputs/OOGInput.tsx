import React, {
  ChangeEvent,
  forwardRef,
  ForwardRefRenderFunction,
  useContext,
  useImperativeHandle,
  useRef,
} from 'react';
import set from 'lodash/fp/set';
import InputProps from '../../model/InputProps';
import OOG from '../../model/OOG';
import { Box, TextField } from '@material-ui/core';
import { inlineFormStyles } from './IMOInput';
import ActingAs from '../../contexts/ActingAs';

interface Props extends InputProps<OOG> {}

const focusAndSelect = (input: HTMLInputElement) => {
  input.focus();
  input.setSelectionRange(0, input.value.length);
};

const OOGInput: ForwardRefRenderFunction<any, Props> = ({ value, onChange }, ref) => {
  const classes = inlineFormStyles();
  const input = useRef();
  const [actingAs] = useContext(ActingAs);
  const isAdmin = !actingAs;

  useImperativeHandle(ref, () => ({
    focus: () => {
      focusAndSelect(input.current!);
    },
  }));

  const handleWidthChange = (e: ChangeEvent<HTMLInputElement>) =>
    onChange(set('width', e.target.value)(value));
  const handleHeightChange = (e: ChangeEvent<HTMLInputElement>) =>
    onChange(set('height', e.target.value)(value));
  const handleLengthChange = (e: ChangeEvent<HTMLInputElement>) =>
    onChange(set('length', e.target.value)(value));
  const handleWeightChange = (e: ChangeEvent<HTMLInputElement>) =>
    onChange(set('weight', e.target.value)(value));
  const handleOverwidthChange = (e: ChangeEvent<HTMLInputElement>) =>
    onChange(set('diffWidth', e.target.value)(value));
  const handleOverheightChange = (e: ChangeEvent<HTMLInputElement>) =>
    onChange(set('diffHeight', e.target.value)(value));
  const handleOverlengthChange = (e: ChangeEvent<HTMLInputElement>) =>
    onChange(set('diffLength', e.target.value)(value));
  const handleOverweightChange = (e: ChangeEvent<HTMLInputElement>) =>
    onChange(set('diffWeight', e.target.value)(value));
  const handleDisplacementChange = (e: ChangeEvent<HTMLInputElement>) =>
    onChange(set('displacement', e.target.value)(value));

  return (
    <React.Fragment>
      <Box display="flex" className={classes.formControl}>
        <TextField
          label="Max Length [cm]"
          variant="outlined"
          value={value.length || ''}
          onChange={handleLengthChange}
          margin="dense"
        />
        <TextField
          inputRef={input}
          label="Max Width [cm]"
          margin="dense"
          variant="outlined"
          value={value.width || ''}
          onChange={handleWidthChange}
        />
        <TextField
          label="Max Height [cm]"
          variant="outlined"
          value={value.height || ''}
          onChange={handleHeightChange}
          margin="dense"
        />
        <TextField
          label="Max Weight [kg]"
          variant="outlined"
          value={value.weight || ''}
          onChange={handleWeightChange}
          margin="dense"
        />
      </Box>
      {isAdmin && (
        <Box display="flex" className={classes.formControl}>
          <TextField
            label="OL [cm]"
            variant="outlined"
            value={value.diffLength || ''}
            onChange={handleOverlengthChange}
            margin="dense"
          />
          <TextField
            inputRef={input}
            label="OW [cm]"
            margin="dense"
            variant="outlined"
            value={value.diffWidth || ''}
            onChange={handleOverwidthChange}
          />
          <TextField
            label="OH [cm]"
            variant="outlined"
            value={value.diffHeight || ''}
            onChange={handleOverheightChange}
            margin="dense"
          />
          <TextField
            label="OWg [kg]"
            variant="outlined"
            value={value.diffWeight || ''}
            onChange={handleOverweightChange}
            margin="dense"
          />
          <TextField
            label="Displacement"
            variant="outlined"
            type="number"
            value={value.displacement || ''}
            onChange={handleDisplacementChange}
            margin="dense"
          />
        </Box>
      )}
    </React.Fragment>
  );
};

export default forwardRef(OOGInput);
