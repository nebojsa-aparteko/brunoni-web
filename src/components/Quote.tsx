import React, { useContext } from 'react';
import {
  Box,
  Container,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  Grid,
  makeStyles,
  Paper,
  Theme,
} from '@material-ui/core';
import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import update from 'lodash/fp/update';
import sortBy from 'lodash/sortBy';
import { QuoteHeader, QuoteItemNormalized, TermTerm } from '../model/quotes/QuotesResult';
import QuotesContext from '../contexts/Quotes';
import QuoteItem from './quotes/QuoteItem';
import InfoBoxItem from './InfoBoxItem';

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

const updateQuoteBody = update('Quote', updateQuoteResults);

const initialResults =
  process.env.NODE_ENV !== 'production' ? updateQuoteBody(require('../test/QuotesDataTest.json')) : undefined;

const Quote: React.FC<Props> = ({ id }) => {
  const { busy, error, result, refresh } = useContext(QuotesContext);
  const classes = useStyles();
  const quoteHeader = result?.QuoteHeader?.find((quote: QuoteHeader) => quote.QuoteNumber === id);

  if (!quoteHeader) {
    return null;
  }

  const asArray = (item: any) => (item === null ? [] : Array.isArray(item) ? item : [item]);
  const normalizeQuoteHeaderProps = flow(
    update('QuoteDetails', flow(asArray, map(update('QuoteDetail', asArray)))),
    update('CostDetailsRemarks', flow(asArray, map(update('CostDetailRemark', asArray)))),
    update('ServiceDetail', asArray),
    update('CargoDetails', flow(asArray, map(update('CargoDetail', asArray)))),
    update('Remarks', flow(asArray, map(update('Remark', asArray)))),
    update('Terms', flow(asArray, map(update('Term', asArray)))),
  );
  const normalizedQuotesResult = normalizeQuoteHeaderProps(quoteHeader);

  let normalizedQuoteItems: QuoteItemNormalized[] = [];
  for (let i = 0; i < normalizedQuotesResult.QuoteDetails.length; i++) {
    normalizedQuoteItems[i] = {
      QuoteDetails: normalizedQuotesResult.QuoteDetails[i].QuoteDetail,
      CargoDetail: normalizedQuotesResult.CargoDetails[i] ? normalizedQuotesResult.CargoDetails[i].CargoDetail : [],
      Remarks: normalizedQuotesResult.Remarks[i].Remark,
      CostDetailsRemarks: normalizedQuotesResult.CostDetailsRemarks[i]
        ? normalizedQuotesResult.CostDetailsRemarks[i].CostDetailRemark
        : [],
      Terms: normalizedQuotesResult.Terms[i]
        ? normalizedQuotesResult.Terms[i].Term.filter((item: TermTerm) => item.TermLabel === null)
        : [],
      ServiceDetail: normalizedQuotesResult.ServiceDetail[i],
      TermsHeader: normalizedQuotesResult.Terms[i]
        ? normalizedQuotesResult.Terms[i].Term.filter((item: TermTerm) => item.TermLabel !== null)
        : [],
      QuoteHeader: normalizedQuotesResult,
    };
  }
  console.log('Normalized ', normalizedQuoteItems);

  return (
    <Container maxWidth="lg">
      <Paper className={classes.root}>
        {normalizedQuoteItems.map(quoteItem => (
          <Grid item xs={12}>
            <QuoteItem quoteItemNormalized={quoteItem} />
          </Grid>
        ))}
      </Paper>
    </Container>
  );
};

export default Quote;
