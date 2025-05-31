import { Box } from '@material-ui/core';
import React from 'react';
import { ButtonLink } from './Link';

interface Props {}

const GetQuotesButton: React.FC<Props> = () => (
  <Box display="flex" flexDirection="row-reverse" pt={0} pb={0}>
    <ButtonLink to="/quotes/get" color="primary" variant="contained">
      Get Quote
    </ButtonLink>
  </Box>
);

export default GetQuotesButton;
