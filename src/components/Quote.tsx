import React, { Fragment, useContext } from 'react';
import {
  Box,
  // Box,
  Button,
  Container,
  Divider,
  Grid,
  // ExpansionPanel,
  // ExpansionPanelDetails,
  // ExpansionPanelSummary,
  // Grid,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
  Theme,
  Typography,
} from '@material-ui/core';
import flow from 'lodash/fp/flow';
// import map from 'lodash/fp/map';
// import update from 'lodash/fp/update';
import groupBy from 'lodash/fp/groupBy';
import toPairs from 'lodash/fp/toPairs';
// import sortBy from 'lodash/sortBy';
import { QuoteHeader, Term /*QuoteItemNormalized, TermTerm*/ } from '../model/quotes/QuotesResult';
import QuotesEndpointContext from '../contexts/QuotesEndpoint';
// import QuoteItem from './quotes/QuoteItem';
// import asArray from '../utilities/asArray';
// import useTestData from '../utilities/useTestData';
import { Link as RouterLink } from 'react-router-dom';
import QuoteItem from './quotes/QuoteItem';
import Page from './quotes/Page';
import QuoteItemHeader from './quotes/QuoteItemHeader';
import QuoteItemCargoDetail from './quotes/QuoteItemCargoDetail';
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

// const updateQuoteResults = (quotes: QuoteHeader[]) => sortBy(quotes, (quote: QuoteHeader) => quote.QuoteDate);

const Quote: React.FC<Props> = ({ id }) => {
  const classes = useStyles();

  const { result } = useContext(QuotesEndpointContext);

  const quoteGroup = (result || []).find(group => Boolean(group.quotes.find(quote => quote.QuoteNumber === id)));

  if (!quoteGroup) {
    return null;
  }

  const quote = quoteGroup.quotes.find(quote => quote.QuoteNumber === id);

  if (!quote) {
    return null;
  }

  // const asArray = (item: any) => (item === null ? [] : Array.isArray(item) ? item : [item]);
  // const normalizeQuoteHeaderProps = flow(
  //   update('QuoteDetails', flow(asArray, map(update('QuoteDetail', asArray)))),
  //   update('CostDetailsRemarks', flow(asArray, map(update('CostDetailRemark', asArray)))),
  //   update('ServiceDetail', asArray),
  //   update('CargoDetails', flow(asArray, map(update('CargoDetail', asArray)))),
  //   update('Remarks', flow(asArray, map(update('Remark', asArray)))),
  //   update('Terms', flow(asArray, map(update('Term', asArray)))),
  // );
  // const normalizedQuotesResult = normalizeQuoteHeaderProps(quoteHeader);
  //
  // let normalizedQuoteItems: QuoteItemNormalized[] = [];
  // for (let i = 0; i < normalizedQuotesResult.QuoteDetails.length; i++) {
  //   normalizedQuoteItems[i] = {
  //     QuoteDetails: normalizedQuotesResult.QuoteDetails[i].QuoteDetail,
  //     CargoDetail: normalizedQuotesResult.CargoDetails[i] ? normalizedQuotesResult.CargoDetails[i].CargoDetail : [],
  //     Remarks: normalizedQuotesResult.Remarks[i].Remark,
  //     CostDetailsRemarks: normalizedQuotesResult.CostDetailsRemarks[i]
  //       ? normalizedQuotesResult.CostDetailsRemarks[i].CostDetailRemark
  //       : [],
  //     Terms: normalizedQuotesResult.Terms[i]
  //       ? normalizedQuotesResult.Terms[i].Term.filter((item: TermTerm) => item.TermLabel === null)
  //       : [],
  //     ServiceDetail: normalizedQuotesResult.ServiceDetail[i],
  //     TermsHeader: normalizedQuotesResult.Terms[i]
  //       ? normalizedQuotesResult.Terms[i].Term.filter((item: TermTerm) => item.TermLabel !== null)
  //       : [],
  //     QuoteHeader: normalizedQuotesResult,
  //   };
  // }
  // console.log('Normalized ', normalizedQuoteItems);

  console.log('quote', quote);

  // TODO

  return (
    <Container maxWidth="lg">
      <Paper className={classes.root}>
        <Grid item xs={12}>
          <Page title="Quotation">
            <Grid container spacing={2}>
              {/*<Grid item xs={6}>*/}
              {/*<QuoteItemHeader quoteHeader={quote} termsHeader={quote.Terms} />*/}
              {/*</Grid>*/}
              {/*<Grid item xs={6}>*/}
              {/*<QuoteItemCargoDetail cargoDetails={quote.CargoDetail} />*/}
              {/*</Grid>*/}
              {/*<Grid item xs={12}>*/}
              {/*<Divider />*/}
              {/*</Grid>*/}
              {/*<QuoteItemTerms terms={quote.Terms.Term} />*/}
              {/*<QuoteItemQuoteDetails quoteDetails={quote.QuoteDetails} />*/}
              {/*<QuoteItemCostDetailsRemark costDetailRemarks={quote.CostDetailsRemarks} />*/}
              {/*<QuoteItemServiceDetail serviceDetailElement={quote.ServiceDetail} />*/}
              {/*<QuoteItemRemarks remarks={quote.Remarks} />*/}
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
