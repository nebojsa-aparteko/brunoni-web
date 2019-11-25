import { CargoDetailCargoDetail, QuoteHeader, TermTerm } from '../../model/quotes/QuotesResult';
import React, { Fragment } from 'react';
import { Grid, Typography, Link } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import InfoBoxItemHorizontal from '../InfoBoxItemHorizontal';
import CarriersContext from '../../contexts/Carriers';
import Carrier from '../../model/Carrier';

interface Props {
  termsHeader: TermTerm[];
  quoteHeader: QuoteHeader;
}

const QuoteItemHeader: React.FC<Props> = ({ quoteHeader, termsHeader }) => {
  const carriers = React.useContext(CarriersContext);
  const carrier = ((carrierID: string) => carriers && carriers.find(item => item.ID === carrierID))(
    quoteHeader.CarrierID,
  );
  console.debug('Carriers', carriers);
  return (
    <Fragment>
      <Grid item xs={12}>
        <InfoBoxItemHorizontal title="Quote Number" label1={quoteHeader.QuoteNumber} />
      </Grid>
      <Grid item xs={12}>
        <InfoBoxItemHorizontal title="Quote Date" label1={quoteHeader.QuoteDate} />
        <Divider />
      </Grid>

      <Grid item xs={12}>
        <InfoBoxItemHorizontal title="Quote Reference" label1={quoteHeader.AdrId} />
      </Grid>

      {carrier && (
        <Grid item xs={12}>
          <InfoBoxItemHorizontal title="Carrier" label1={carrier.CarrierName} />
        </Grid>
      )}

      {termsHeader.map((term: TermTerm) => (
        <Grid item xs={12}>
          <InfoBoxItemHorizontal title={term.TermLabel} label1={term.TermValue} />
        </Grid>
      ))}

      <Grid item xs={12}>
        <InfoBoxItemHorizontal title="Quote Validity" label1={quoteHeader.QuoteValidity} />
      </Grid>
    </Fragment>
  );
};

export default QuoteItemHeader;
