import { Box, Button } from '@material-ui/core';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

interface Props {}

const GetQuotesButton: React.FC<Props> = () => (
  <Box display="flex" flexDirection="row-reverse" pt={2} pb={0}>
    <Button component={RouterLink} to="/quotes/get" color="primary" variant="contained">
      Get Quote
    </Button>
  </Box>
);

export default GetQuotesButton;
