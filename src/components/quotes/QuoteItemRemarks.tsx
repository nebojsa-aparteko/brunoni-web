import { RemarkRemark } from '../../model/quotes/QuotesResult';
import React, { Fragment } from 'react';
import { Grid } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import InfoBoxItem from '../InfoBoxItem';

interface Props {
  remarks: RemarkRemark[];
}

const QuoteItemRemarks: React.FC<Props> = ({ remarks }) => (
  <Fragment>
    <Divider />
    {remarks.map((remark: RemarkRemark) => (
      <Fragment>
        <Grid item md={3} xs={12}>
          <InfoBoxItem title={remark.RemarkTitle} label1={remark.RemarkLabel} />
        </Grid>
        <Grid item md={9} xs={12}>
          <InfoBoxItem label1={remark.RemarkText} />
        </Grid>
      </Fragment>
    ))}
  </Fragment>
);

export default QuoteItemRemarks;
