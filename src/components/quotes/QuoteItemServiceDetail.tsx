import { QuoteDetailQuoteDetail, ServiceDetailElement } from '../../model/quotes/QuotesResult';
import React, { Fragment } from 'react';
import { Grid } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableBody from '@material-ui/core/TableBody';
import Divider from '@material-ui/core/Divider';
import InfoBoxItem from '../InfoBoxItem';

interface Props {
  serviceDetailElement: ServiceDetailElement;
}
const QuoteItemServiceDetail: React.FC<Props> = ({ serviceDetailElement }) => (
  <Fragment>
    <Divider />
    <Grid item xs={4}>
      <InfoBoxItem title="Frequency" label1={serviceDetailElement.Frequency} />
    </Grid>
    <Grid item xs={4}>
      <InfoBoxItem title="Routing" label1={serviceDetailElement.Routing} />
    </Grid>
    <Grid item xs={4}>
      <InfoBoxItem title="Transit Time" label1={serviceDetailElement.TransitTime} />
    </Grid>
  </Fragment>
);

export default QuoteItemServiceDetail;
