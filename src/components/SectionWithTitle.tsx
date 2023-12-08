import React, { PropsWithChildren } from 'react';
import { Box, Paper, Typography } from '@material-ui/core';
import theme from '../theme';

interface Props extends PropsWithChildren<any> {
  title: string;
  ActionElement?: React.ReactChild | null;
}

const SectionWithTitle: React.FC<Props> = ({ title, ActionElement, children }) => {
  return (
    <Box
      component={Paper}
      p={2}
      display="flex"
      flexDirection="column"
      flex={1}
      style={{ gap: theme.spacing(2) }}
      bgcolor="white"
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h3">{title}</Typography>
        {ActionElement ? ActionElement : null}
      </Box>
      {children}
    </Box>
  );
};

export default SectionWithTitle;
