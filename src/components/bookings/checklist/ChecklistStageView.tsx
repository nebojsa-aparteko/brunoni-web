import React from 'react';
import { Stage } from './ChecklistItemModel';
import { Box, FormControlLabel, Checkbox, Typography } from '@material-ui/core';
import { capitalCase } from 'change-case';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';

const ChecklistStageView = ({ stage, handleChange, disabled }: Props) => {
  return (
    <Box display="flex" flex={1} flexDirection="column">
      <FormControlLabel
        disabled={disabled}
        control={
          <Checkbox
            checked={stage.checked}
            onChange={event => {
              handleChange(stage, event.target.checked);
            }}
            name={stage.label}
            color="primary"
          />
        }
        label={stage.label}
      />
      {stage.checked && stage.by && stage.at && (
        <Typography color="textSecondary" variant="caption">
          by {capitalCase(stage.by?.firstName)} {formatDistanceToNow(new Date())} ago
        </Typography>
      )}{' '}
    </Box>
  );
};

export default ChecklistStageView;

export interface Props {
  stage: Stage;
  handleChange: (stage: Stage, checked: boolean) => void;
  disabled: boolean | undefined;
}
