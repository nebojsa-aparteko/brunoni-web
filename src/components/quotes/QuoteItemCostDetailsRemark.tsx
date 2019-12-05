import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { CostDetailRemark } from '../../providers/QuoteGroups';

interface Props {
  costDetailRemarks: CostDetailRemark[];
}

const QuoteItemCostDetailsRemark: React.FC<Props> = ({ costDetailRemarks }) => (
  <Grid item xs={12}>
    {costDetailRemarks.map((costDetailRemark, i) => (
      <Typography key={i} variant="body2">
        {costDetailRemark.RemarkRef} {costDetailRemark.RemarkText}
      </Typography>
    ))}
  </Grid>
);

export default QuoteItemCostDetailsRemark;
