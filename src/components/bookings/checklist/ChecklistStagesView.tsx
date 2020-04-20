import React from 'react';
import { Stage } from './ChecklistItemModel';
import { Box } from '@material-ui/core';
import ChecklistStageView from './ChecklistStageView';

const ChecklistStagesView = ({ stages, handleChange }: Props) => {
  return (
    <Box display="flex" flexWrap="wrap">
      {stages.map((stage, index) => (
        <ChecklistStageView
          stage={stage}
          handleChange={handleChange}
          disabled={index > 0 && !stages[index - 1].checked}
        />
      ))}
    </Box>
  );
};

export default ChecklistStagesView;

export interface Props {
  stages: Stage[];
  handleChange: (stage: Stage, checked: boolean) => void;
}
