import React, { useContext } from 'react';
import { Box, Button, Grid } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
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
      {result ? (
        <QuotesList quoteHeaders={result.QuoteHeader} />
      ) : (
        <Container>
          <Grid container spacing={4}>
            <Grid item md={3}>
              <Skeleton variant="rect" width="100%" height={450} />
            </Grid>
            <Grid item md={9}>
              <Skeleton variant="rect" width="100%" height={104} />
              <Skeleton variant="rect" width="100%" height={232} />
              <Skeleton variant="rect" width="100%" height={232} />
            </Grid>
          </Grid>
        </Container>
      )}
    </Box>
  );
};

export default Quotes;
