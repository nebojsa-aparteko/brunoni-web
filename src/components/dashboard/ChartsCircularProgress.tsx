import { Box, CircularProgress } from '@material-ui/core';
import React from 'react';

const ChartsCircularProgress: React.FC = () => (
  <Box display="flex" justifyContent="center" height={150}>
    <CircularProgress style={{ alignSelf: 'center' }} />
  </Box>
);

export default ChartsCircularProgress;
