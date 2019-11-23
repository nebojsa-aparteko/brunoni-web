import { Term, TermTerm } from '../../model/quotes/QuotesResult';
import React, { Fragment } from 'react';
import { Grid } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import InfoBoxItem from '../InfoBoxItem';

interface Props {
  terms: Term;
}

const QuoteItemTerms: React.FC<Props> = ({ terms }) => (
  <Fragment>
    {terms.Term.map((term: TermTerm) => (
      <Fragment>
        <Divider />
        <Grid item xs={4}>
          <InfoBoxItem title="Term Label" label1={term.TermLabel || ''} />
        </Grid>
        <Grid item xs={4}>
          <InfoBoxItem title="Term Detail" label1={term.TermDetail || ''} />
        </Grid>
        <Grid item xs={4}>
          <InfoBoxItem title="Term Value" label1={term.TermValue} />
        </Grid>
      </Fragment>
    ))}
  </Fragment>
);

export default QuoteItemTerms;
