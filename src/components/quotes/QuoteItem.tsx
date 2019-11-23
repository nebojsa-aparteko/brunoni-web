import React, { Fragment } from 'react';
import { Grid } from '@material-ui/core';
import { QuoteItemNormalized } from '../../model/quotes/QuotesResult';
import QuoteItemQuoteDetails from './QuoteItemQuoteDetails';
import Container from '@material-ui/core/Container';
import Page from './Page';
import QuoteItemServiceDetail from './QuoteItemServiceDetail';
import QuoteItemTerms from './QuoteItemTerms';

interface Props {
  quoteItemNormalized: QuoteItemNormalized;
}

const QuoteItem: React.FC<Props> = ({ quoteItemNormalized }) => (
  <Page title="Quotation">
    <Container maxWidth="lg">
      <Grid container spacing={4}>
        <QuoteItemQuoteDetails quoteDetails={quoteItemNormalized.QuoteDetails} />
        <QuoteItemServiceDetail serviceDetailElement={quoteItemNormalized.ServiceDetail} />
        <QuoteItemTerms terms={quoteItemNormalized.Terms} />
      </Grid>
    </Container>
  </Page>
);

export default QuoteItem;
