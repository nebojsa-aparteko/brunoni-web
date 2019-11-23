import { QuoteHeader, TermTerm } from '../../model/quotes/QuotesResult';
import React, { Fragment } from 'react';
import { Grid, Typography, Link } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import InfoBoxItemHorizontal from '../InfoBoxItemHorizontal';

interface Props {
  termsHeader: TermTerm[];
  quoteHeader: QuoteHeader;
}

const QuoteItemHeader: React.FC<Props> = ({ quoteHeader, termsHeader }) => (
  <Fragment>
    <Grid item xs={12}>
      <InfoBoxItemHorizontal title="Quote Date" label1={quoteHeader.QuoteDate} />
      <Divider />
    </Grid>

    <Grid item xs={12}>
      <InfoBoxItemHorizontal title="Quote Reference" label1={quoteHeader.AdrId} />
    </Grid>

    {termsHeader.map((term: TermTerm) => (
      <Grid item xs={12}>
        <InfoBoxItemHorizontal title={term.TermLabel} label1={term.TermValue} />
      </Grid>
    ))}

    <Grid item xs={12}>
      <InfoBoxItemHorizontal title="Quote Validity" label1={quoteHeader.QuoteValidity} />
    </Grid>

    <Grid item xs={12}>
      <Divider />
    </Grid>
  </Fragment>
);

export default QuoteItemHeader;
