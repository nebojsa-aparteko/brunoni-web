import React, { useEffect, useState } from 'react';
import { Box, Grid } from '@material-ui/core';
import useUser from '../hooks/useUser';
import update from 'lodash/fp/update';
import QuotesResult, { QuoteHeader } from '../model/quotes/QuotesResult';
import Container from './Container';
import { Skeleton } from '@material-ui/lab';
import sortBy from 'lodash/sortBy';
import QuotesList from './quotes/index.js';

interface Props {}

const updateQuoteResults = (quotes: QuoteHeader[]) => sortBy(quotes, (quote: QuoteHeader) => quote.QuoteDate);

const initialResults =
  process.env.NODE_ENV !== 'production'
    ? update('Quote', updateQuoteResults)(require('../test/QuotesDataTest.json'))
    : undefined;

const useEndpoint = (uri: string) => {
  const user = useUser();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [result, setResult] = useState<QuotesResult | undefined>(initialResults);
  const [request, setRequest] = useState(0);

  useEffect(() => {
    if (!user) {
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    (async () => {
      try {
        const token = await user.getIdToken();

        const response = await fetch(`${process.env.REACT_APP_API_URL}${uri}`, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
          signal,
        });

        if (response.ok) {
          const body = await response.json();
          setResult(update('Quote', updateQuoteResults)(body as QuotesResult));
        } else {
          const body = await response.json();
          setError(body.error);
          console.error(`Failed to request ${uri}`, response, body);
        }
      } catch (e) {
        setError('Something went wrong. Please try again later.');
        console.error('Failed to request the login email', e);
      } finally {
        setBusy(false);
      }
    })();

    return () => {
      controller.abort();
    };
  }, [user, uri, request]);

  const refresh = () => setRequest(request + 1);

  console.log('Results returned', result);

  return { busy: busy, error: error, result: result, refresh: refresh };
};

const Quotes: React.FC<Props> = ({}) => {
  const { busy, error, result, refresh } = useEndpoint('/quotes');

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
