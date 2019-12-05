import React, { Fragment } from 'react';
import { Grid } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import InfoBoxItem from '../InfoBoxItem';
import { Remark } from '../../providers/QuotesEndpoint';

interface Props {
  remarks: Remark[];
}

const QuoteItemRemarks: React.FC<Props> = ({ remarks }) => (
  <Fragment>
    <Divider />
    {remarks.map((remark, i) => (
      <Fragment key={i}>
        <Grid item md={3} sm={4} xs={12}>
          <InfoBoxItem title={remark.RemarkTitle} label1={remark.RemarkLabel} />
        </Grid>
        <Grid item md={9} sm={8} xs={12}>
          <InfoBoxItem label1={remark.RemarkText} />
        </Grid>
      </Fragment>
    ))}
  </Fragment>
);

export default QuoteItemRemarks;
