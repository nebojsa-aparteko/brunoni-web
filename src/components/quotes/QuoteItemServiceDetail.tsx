import React, { Fragment } from 'react';
import { Grid } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import InfoBoxItem from '../InfoBoxItem';
import { ServiceDetail } from '../../providers/QuoteGroups';

interface Props {
  serviceDetails: ServiceDetail[];
}

const QuoteItemServiceDetail: React.FC<Props> = ({ serviceDetails }) => (
  <Fragment>
    {serviceDetails.map((serviceDetail, i) => (
      <Fragment key={i}>
        <Divider />
        <Grid item md={4} xs={4}>
          <InfoBoxItem title="Frequency" label1={serviceDetail.Frequency} />
        </Grid>
        <Grid item md={4} xs={4}>
          <InfoBoxItem title="Routing" label1={serviceDetail.Routing} />
        </Grid>
        <Grid item md={4} xs={4}>
          <InfoBoxItem title="Transit Time" label1={serviceDetail.TransitTime} />
        </Grid>
      </Fragment>
    ))}
  </Fragment>
);

export default QuoteItemServiceDetail;
