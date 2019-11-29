import React, { useContext } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Container,
  Divider,
  Grid,
  makeStyles,
  Paper,
  Theme,
  Typography,
  IconButton,
  Button,
} from '@material-ui/core';
import QuotesEndpointContext from '../contexts/QuotesEndpoint';
import Page from './quotes/Page';
import QuoteItemHeader from './quotes/QuoteItemHeader';
import QuoteItemContainers from './quotes/QuoteItemContainers';
import QuoteItemTerms from './quotes/QuoteItemTerms';
import QuoteItemQuoteDetails from './quotes/QuoteItemQuoteDetails';
import QuoteItemCostDetailsRemark from './quotes/QuoteItemCostDetailsRemark';
import QuoteItemServiceDetail from './quotes/QuoteItemServiceDetail';
import QuoteItemRemarks from './quotes/QuoteItemRemarks';
import ChartsCircularProgress from './dashboard/ChartsCircularProgress';
import SearchEmptyResults from './routeSearch/SearchEmptyResults';
import PrintIcon from '@material-ui/icons/Print';
import { Link as RouterLink } from 'react-router-dom';
import formatDate from 'date-fns/format';

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

const handlePrint = () => {
  window.print();
};

const Quote: React.FC<Props> = ({ id }) => {
  const classes = useStyles();

  const { result } = useContext(QuotesEndpointContext);

  if (!result) {
    return (
      <Container maxWidth="lg">
        <Paper className={classes.root}>
          <ChartsCircularProgress />
        </Paper>
      </Container>
    );
  }

  const quoteGroup = (result || []).find(group => Boolean(group.quotes.find(quote => quote.id === id)));

  if (!quoteGroup) {
    return (
      <SearchEmptyResults
        message={
          'Quote group that you are trying to get cannot be found. Please try going back to quotes page and selecting the quote form there.'
        }
      />
    );
  }

  const quote = quoteGroup.quotes.find(quote => quote.id === id);

  if (!quote) {
    return (
      <SearchEmptyResults
        message={
          'Quote that you are trying to get cannot be found. Please try going back to quotes page and selecting the quote form there.'
        }
      />
    );
  }
  console.log('Quote', quote);

  return (
    <Container maxWidth="lg">
      <Card className={classes.root}>
        <CardHeader
          action={
            <Box display="flex" displayPrint="none">
              <Button
                color="primary"
                variant="contained"
                component={RouterLink}
                size="small"
                to={`/quotes/${quote.id}`}
              >
                Request Booking
              </Button>
              <Button
                aria-label="print"
                variant="outlined"
                size="small"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                style={{ marginLeft: '4px' }}
              >
                Print
              </Button>
            </Box>
          }
          title={`Quotation - ${quote.carrier.name || quote.carrier.id} - ${quote.destination.city}, ${
            quote.destination.country
          }`}
          subheader={formatDate(quote.dateIssued, 'd. MMMM yyyy')}
        />
        <CardContent>
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
        </CardContent>
      </Card>
    </Container>
  );
};

export default Quote;
