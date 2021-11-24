import React, { PropsWithChildren } from 'react';
import { Box, Paper, Typography } from '@material-ui/core';
import theme from '../theme';

interface Props extends PropsWithChildren<any> {
  title: string;
}
const SectionWithTitle: React.FC<Props> = ({ title, children }) => {
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
      <Typography variant="h3">{title}</Typography>
      {children}
    </Box>
  );
};

export default SectionWithTitle;
