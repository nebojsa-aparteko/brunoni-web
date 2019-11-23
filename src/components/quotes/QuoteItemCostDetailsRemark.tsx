import { CostDetailRemark } from '../../model/quotes/QuotesResult';
import React from 'react';
import { Grid, Typography } from '@material-ui/core';

interface Props {
  costDetailRemarks: CostDetailRemark[];
}

const QuoteItemCostDetailsRemark: React.FC<Props> = ({ costDetailRemarks }) => (
  <Grid item xs={12}>
    {costDetailRemarks.map((costDetailRemark: CostDetailRemark) => (
      <Typography variant="body2">
        {costDetailRemark.RemarkRef} {costDetailRemark.RemarkText}
      </Typography>
    ))}
  </Grid>
);

export default QuoteItemCostDetailsRemark;
