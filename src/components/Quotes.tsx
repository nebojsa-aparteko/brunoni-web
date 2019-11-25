import React from 'react';
import { Box, Grid } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import update from 'lodash/fp/update';
import sortBy from 'lodash/sortBy';
import useEndpoint from '../hooks/useEndpoint';
import { QuoteHeader } from '../model/quotes/QuotesResult';
import Container from './Container';
import QuotesList from './quotes/index';

interface Props {}

const updateQuoteResults = (quotes: QuoteHeader[]) => sortBy(quotes, (quote: QuoteHeader) => quote.QuoteDate);

const updateQuoteBody = update('Quote', updateQuoteResults);

const initialResults =
  process.env.NODE_ENV !== 'production' ? updateQuoteBody(require('../test/QuotesDataTest.json')) : undefined;

const Quotes: React.FC<Props> = ({}) => {
  const { busy, error, result, refresh } = useEndpoint('/quotes', updateQuoteBody, initialResults);

  return (
    <Box>
      {/*<Box>
        <Typography variant="h6">Busy</Typography>
        <Typography variant="caption">{JSON.stringify(busy)}</Typography>
      </Box>
      <Box>
        <Typography variant="h6">Error</Typography>
        <Typography variant="caption">{JSON.stringify(error)}</Typography>
      </Box>*/}
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
      {/*<Box>
        <Typography variant="h6">Refresh</Typography>
        <Typography variant="caption">{JSON.stringify(refresh)}</Typography>
      </Box>*/}
    </Box>
  );
};

export default Quotes;
