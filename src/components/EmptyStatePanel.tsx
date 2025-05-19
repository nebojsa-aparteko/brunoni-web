import React from 'react';
import { Box, Button, Typography } from '@material-ui/core';

interface EmptyStatePanelProps {
  title?: string;
  subtitle?: string;
  actionLabel?: string;
  actionIcon?: any;
  action?: any;
}

const EmptyStatePanel: React.FC<EmptyStatePanelProps> = ({
  title,
  subtitle,
  actionLabel,
  actionIcon,
  action,
}) => {
  return (
    <Box p={4} textAlign="center">
      <Typography variant="h4" color="textSecondary" gutterBottom>
        {title || 'No items'}
      </Typography>
      {subtitle && (
        <Typography color="textSecondary" gutterBottom>
          {subtitle}
        </Typography>
      )}
      {action && (
        <Box mt={2}>
          <Button onClick={action} startIcon={actionIcon} variant="contained" color="primary">
            {actionLabel || 'Add'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default EmptyStatePanel;
