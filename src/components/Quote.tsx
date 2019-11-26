import React, { Fragment, useContext } from 'react';
import {
  Box,
  Button,
  Container,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Grid,
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
import map from 'lodash/fp/map';
import update from 'lodash/fp/update';
import groupBy from 'lodash/fp/groupBy';
import toPairs from 'lodash/fp/toPairs';
import sortBy from 'lodash/sortBy';
import { QuoteHeader, QuoteItemNormalized, TermTerm } from '../model/quotes/QuotesResult';
import QuotesContext from '../contexts/Quotes';
import QuoteItem from './quotes/QuoteItem';
import asArray from '../utilities/asArray';
import useTestData from '../utilities/useTestData';
import { Link as RouterLink } from 'react-router-dom';

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

const updateQuoteResults = (quotes: QuoteHeader[]) => sortBy(quotes, (quote: QuoteHeader) => quote.QuoteDate);

const Quote: React.FC<Props> = ({ id }) => {
  const { busy, error, result, refresh } = useContext(QuotesContext);
  const classes = useStyles();
  const quotes = (result as any)?.find((quotes: QuoteHeader[]) => quotes[0].idRequest === id);

  if (!quotes) {
    return null;
  }

  const carrierQuotes = flow(groupBy('CarrierID'), toPairs)(quotes);

  return (
    <Fragment>
      {carrierQuotes.map(([carrierId, quotes]) => (
        <Container id={carrierId} maxWidth="lg">
          <Paper className={classes.root}>
            <Typography variant="h4" gutterBottom>
              {carrierId}
            </Typography>
            <Table size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  {quotes.map((quote: any) => (
                    <TableCell key={quote.QuoteNumber}>{quote.QuoteValidity}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[...Array(quotes[0].QuoteDetails.length)].map((_, i) => {
                  return (
                    <TableRow key={i}>
                      <TableCell component="th" scope="row">
                        {quotes[0].QuoteDetails[i].Description}
                      </TableCell>
                      {quotes.map((quote: any) => (
                        <TableCell key={quote.QuoteNumber}>
                          <Typography>
                            {quote.QuoteDetails[i].CostValue} {quote.QuoteDetails[i].Currency}{' '}
                            {quote.QuoteDetails[i].CostUnit}
                          </Typography>
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell></TableCell>
                  {quotes.map((quote: any) => (
                    <TableCell key={quote.QuoteNumber}>
                      <Button color="primary" component={RouterLink} size="small" to={`/quotes/${quote.QuoteNumber}`}>
                        View more
                      </Button>
                    </TableCell>
                  ))}
                </TableRow>
              </TableFooter>
            </Table>
          </Paper>
        </Container>
      ))}
    </Fragment>
  );

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
  //
  // return (
  //   <Container maxWidth="lg">
  //     <Paper className={classes.root}>
  //       {quoteHeader[0].map((quoteItem: QuoteHeader) => (
  //         <Grid item xs={12}>
  //           <QuoteItem quoteItemNormalized={quoteItem} />
  //         </Grid>
  //       ))}
  //     </Paper>
  //   </Container>
  // );
};

export default Quote;
