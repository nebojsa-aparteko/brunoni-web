import React from 'react';
import { Stage } from './ChecklistItemModel';
import { Box } from '@material-ui/core';
import ChecklistStageView from './ChecklistStageView';

const ChecklistStagesView = ({ stages, handleChange }: Props) => {
  return (
    <Box display="flex" flexWrap="wrap">
      {stages.map(stage => (
        <ChecklistStageView stage={stage} handleChange={handleChange} />
      ))}
    </Box>
  );
};

export default ChecklistStagesView;

export interface Props {
  stages: Stage[];
  handleChange: () => void;
}
