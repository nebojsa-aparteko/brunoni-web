import React from 'react';
import { Stage } from './ChecklistItemModel';
import { Box, Checkbox, FormControlLabel, Typography } from '@material-ui/core';
import { capitalCase } from 'change-case';
import safeInvoke from '../../../utilities/safeInvoke';
import { formatDistanceToNowConfigured } from '../../../utilities/formattingHelpers';

const ChecklistStageView = ({ stage, handleChange, disabled }: Props) => {
  return (
    <Box display="flex" flexBasis="fit-content" flexDirection="column" ml={2}>
      <FormControlLabel
        disabled={disabled}
        control={
          <Checkbox
            defaultChecked={stage.checked}
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
          by {capitalCase(stage.by?.firstName)} {formatDistanceToNowConfigured(safeInvoke('toDate')(stage.at))} ago
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
