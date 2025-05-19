import React, { Fragment, useState } from 'react';
import { Stage } from './ChecklistItemModel';
import { Box, Checkbox, FormControlLabel, Typography } from '@material-ui/core';
import { capitalCase } from 'change-case';
import safeInvoke from '../../../utilities/safeInvoke';
import { formatDistanceToNowConfigured } from '../../../utilities/formattingHelpers';
import ActionModal from './ActionModel';

const ChecklistStageView = ({ stage, handleChange, disabled }: Props) => {
  const [isActionDialogOpen, setActionDialogOpen] = useState(false);

  return (
    <Fragment>
      <Box display="flex" flexBasis="fit-content" flexDirection="column" ml={2}>
        <FormControlLabel
          disabled={disabled}
          control={
            <Checkbox
              onChange={event => {
                event.target.checked
                  ? handleChange(stage, event.target.checked)
                  : setActionDialogOpen(true);
              }}
              name={stage.label}
              color="primary"
              checked={stage.checked}
            />
          }
          label={stage.label}
        />
        {stage.checked && stage.by && stage.at && (
          <Typography color="textSecondary" variant="caption">
            by {capitalCase(stage.by?.firstName)}{' '}
            {formatDistanceToNowConfigured(safeInvoke('toDate')(stage.at))}
          </Typography>
        )}{' '}
      </Box>
      {isActionDialogOpen && (
        <ActionModal
          isOpen={isActionDialogOpen}
          handleClose={() => setActionDialogOpen(false)}
          onSuccess={() => handleChange(stage, false)}
        >
          <Typography>
            Are you sure you want to uncheck an item? If you uncheck item, that can generate new
            notification to the customer?
          </Typography>
        </ActionModal>
      )}
    </Fragment>
  );
};

export default ChecklistStageView;

export interface Props {
  stage: Stage;
  handleChange: (stage: Stage, checked: boolean) => void;
  disabled: boolean | undefined;
}
