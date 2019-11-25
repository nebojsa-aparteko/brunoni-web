import React, { useContext } from 'react';
import { Box, Grid } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import Container from './Container';
import QuotesList from './quotes/index';
import QuotesContext from '../contexts/Quotes';

interface Props {}

const Quotes: React.FC<Props> = ({}) => {
  const { busy, error, result, refresh } = useContext(QuotesContext);

  return (
    <Box>
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
