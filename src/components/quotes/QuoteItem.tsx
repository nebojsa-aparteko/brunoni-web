import React, { Fragment } from 'react';
import { Grid, Divider, Typography, Box } from '@material-ui/core';
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
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <QuoteItemHeader quoteHeader={quoteItemNormalized.QuoteHeader} termsHeader={quoteItemNormalized.TermsHeader} />
      </Grid>
      <Grid item xs={6}>
        <QuoteItemCargoDetail cargoDetails={quoteItemNormalized.CargoDetail} />
      </Grid>
      <Grid item xs={12}>
        <Divider />
      </Grid>
      <QuoteItemTerms terms={quoteItemNormalized.Terms} />
      <QuoteItemQuoteDetails quoteDetails={quoteItemNormalized.QuoteDetails} />
      <QuoteItemCostDetailsRemark costDetailRemarks={quoteItemNormalized.CostDetailsRemarks} />
      <QuoteItemServiceDetail serviceDetailElement={quoteItemNormalized.ServiceDetail} />
      <QuoteItemRemarks remarks={quoteItemNormalized.Remarks} />
    </Grid>

    <Box displayPrint="block" display="none" marginTop="4em">
      <Divider />
      <Typography variant="body1">
        Bei Fragen oder für weitere Informationen stehen wir Ihnen gerne zur Verfügung. Mit Freude sehen wir Ihrem
        Feedback entgegen.
        <br />
        <br />
        Freundliche Grüsse
        <br />
        Fabio Manuzzi
        <br />
        f.manuzzi@brunoni.ch
        <br />
        Tel. +41 44 455 58 91
      </Typography>
    </Box>
  </Page>
);

export default QuoteItem;
