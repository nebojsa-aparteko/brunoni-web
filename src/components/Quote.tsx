import React, { useContext } from 'react';
import { Box, Container, Divider, Grid, makeStyles, Paper, Theme, Typography } from '@material-ui/core';
import QuotesEndpointContext from '../contexts/QuotesEndpoint';
import Page from './quotes/Page';
import QuoteItemHeader from './quotes/QuoteItemHeader';
import QuoteItemContainers from './quotes/QuoteItemContainers';
import QuoteItemTerms from './quotes/QuoteItemTerms';
import QuoteItemQuoteDetails from './quotes/QuoteItemQuoteDetails';
import QuoteItemCostDetailsRemark from './quotes/QuoteItemCostDetailsRemark';
import QuoteItemServiceDetail from './quotes/QuoteItemServiceDetail';
import QuoteItemRemarks from './quotes/QuoteItemRemarks';

interface Props {
  id: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(4),
    padding: theme.spacing(3),
  },
}));

const Quote: React.FC<Props> = ({ id }) => {
  const classes = useStyles();

  const { result } = useContext(QuotesEndpointContext);

  const quoteGroup = (result || []).find(group => Boolean(group.quotes.find(quote => quote.id === id)));

  if (!quoteGroup) {
    return null;
  }

  const quote = quoteGroup.quotes.find(quote => quote.id === id);

  if (!quote) {
    return null;
  }

  return (
    <Container maxWidth="lg">
      <Paper className={classes.root}>
        <Grid item xs={12}>
          <Page title="Quotation">
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <QuoteItemHeader quote={quote} />
              </Grid>
              <Grid item xs={6}>
                <QuoteItemContainers containers={quote.containers} />
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <QuoteItemTerms terms={quote.terms} />
              <QuoteItemQuoteDetails quoteDetails={quote.quoteDetails} />
              <QuoteItemCostDetailsRemark costDetailRemarks={quote.costDetailRemarks} />
              <QuoteItemServiceDetail serviceDetails={quote.serviceDetails} />
              <QuoteItemRemarks remarks={quote.remarks} />
            </Grid>

            <Box displayPrint="block" display="none" marginTop="4em">
              <Divider />
              <Typography variant="body1">
                Bei Fragen oder für weitere Informationen stehen wir Ihnen gerne zur Verfügung. Mit Freude sehen wir
                Ihrem Feedback entgegen.
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
        </Grid>
      </Paper>
    </Container>
  );
};

export default Quote;
