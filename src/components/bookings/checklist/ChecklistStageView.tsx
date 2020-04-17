import React from 'react';
import { Stage } from './ChecklistItemModel';
import { Box, FormControlLabel, Checkbox } from '@material-ui/core';

const ChecklistStageView = ({ stage, handleChange }: Props) => {
  return (
    <Box display="flex" flex={1}>
      <FormControlLabel
        control={<Checkbox checked={stage.checked} onChange={handleChange} name={stage.label} color="primary" />}
        label={stage.label}
      />
    </Box>
  );
};

export default ChecklistStageView;

export interface Props {
  stage: Stage;
  handleChange: () => void;
}
