import React, { Fragment } from 'react';
import { Grid } from '@material-ui/core';
import { QuoteItemNormalized } from '../../model/quotes/QuotesResult';
import QuoteItemQuoteDetails from './QuoteItemQuoteDetails';
import Container from '@material-ui/core/Container';
import Page from './Page';
import QuoteItemServiceDetail from './QuoteItemServiceDetail';
import QuoteItemTerms from './QuoteItemTerms';
import QuoteItemCostDetailsRemark from './QuoteItemCostDetailsRemark';
import QuoteItemRemarks from './QuoteItemRemarks';
import QuoteItemHeader from './QuoteItemHeader';
import QuoteItemCargoDetail from './QuoteItemCargoDetail';

interface Props {
  quoteItemNormalized: QuoteItemNormalized;
}

const QuoteItem: React.FC<Props> = ({ quoteItemNormalized }) => (
  <Page title="Quotation">
    <Grid container spacing={4}>
      <QuoteItemHeader quoteHeader={quoteItemNormalized.QuoteHeader} termsHeader={quoteItemNormalized.TermsHeader} />
      <QuoteItemCargoDetail cargoDetails={quoteItemNormalized.CargoDetail} />
      <QuoteItemTerms terms={quoteItemNormalized.Terms} />
      <QuoteItemQuoteDetails quoteDetails={quoteItemNormalized.QuoteDetails} />
      <QuoteItemCostDetailsRemark costDetailRemarks={quoteItemNormalized.CostDetailsRemarks} />
      <QuoteItemServiceDetail serviceDetailElement={quoteItemNormalized.ServiceDetail} />
      <QuoteItemRemarks remarks={quoteItemNormalized.Remarks} />
    </Grid>
  </Page>
);

export default QuoteItem;
