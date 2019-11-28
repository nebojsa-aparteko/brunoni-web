import React, { Fragment } from 'react';
import formatDate from 'date-fns/format';
import { Grid } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import InfoBoxItemHorizontal from '../InfoBoxItemHorizontal';
import { Quote } from '../../providers/QuotesEndpoint';

interface Props {
  quote: Quote;
}

const QuoteItemHeader: React.FC<Props> = ({ quote }) => (
  <Fragment>
    <Grid item xs={12}>
      <InfoBoxItemHorizontal title="Quote Number" label1={quote.id} />
    </Grid>
    <Grid item xs={12}>
      <InfoBoxItemHorizontal title="Quote Date" label1={formatDate(quote.dateIssued, 'd. MMMM yyyy')} />
      <Divider />
    </Grid>

    <Grid item xs={12}>
      <InfoBoxItemHorizontal title="Quote Reference" label1={quote.clientId} />
    </Grid>

    <Grid item xs={12}>
      <InfoBoxItemHorizontal title="Carrier" label1={quote.carrier.name || quote.carrier.id} />
    </Grid>

    {quote.terms
      .filter(term => term.TermLabel === 'TERMS & CONDITIONS')
      .map(term => (
        <Grid item xs={12}>
          <InfoBoxItemHorizontal title="Terms & Conditions" label1={term.TermValue} />
        </Grid>
      ))}

    <Grid item xs={12}>
      <InfoBoxItemHorizontal
        title="Quote Validity"
        label1={`${formatDate(quote.validityPeriod.from, 'd. MMMM')} – ${formatDate(
          quote.validityPeriod.to,
          'd. MMMM',
        )}`}
      />
    </Grid>
  </Fragment>
);

export default QuoteItemHeader;
