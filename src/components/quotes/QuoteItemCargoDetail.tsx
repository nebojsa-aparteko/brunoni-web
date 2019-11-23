import { CargoDetailCargoDetail } from '../../model/quotes/QuotesResult';
import React, { Fragment } from 'react';
import { Grid, Typography, Link } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';

interface Props {
  cargoDetails: CargoDetailCargoDetail[];
}

const QuoteItemCargoDetail: React.FC<Props> = ({ cargoDetails }) => (
  <Grid item xs={12}>
    <Typography variant="body2">
      Cargo details:
      <ul>
        {cargoDetails.map((cargoDetail: CargoDetailCargoDetail) => (
          <li>
            {cargoDetail.Quantity} - {cargoDetail.CtypID}
          </li>
        ))}
      </ul>
    </Typography>
    <Divider />
  </Grid>
);

export default QuoteItemCargoDetail;
