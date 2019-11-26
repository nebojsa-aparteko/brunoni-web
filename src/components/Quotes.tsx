import React, { useContext } from 'react';
import { Box, Button } from '@material-ui/core';
import Container from './Container';
import QuotesList from './quotes/index';
import QuotesContext from '../contexts/Quotes';
import Link from './Link';

interface Props {}

const Quotes: React.FC<Props> = ({}) => {
  const { busy, error, result, refresh } = useContext(QuotesContext);

  return (
    <Box>
      <Container>
        <Box display="flex" pt={2} pb={0}>
          <Box flex="1" />
          <Button component={Link} to="/quotes/get" color="primary" variant="contained">
            Get Quote
          </Button>
        </Box>
      </Container>
      <QuotesList quoteHeaders={result} />
    </Box>
  );
};

export default Quotes;
