import { CargoDetailCargoDetail } from '../../model/quotes/QuotesResult';
import React, { Fragment } from 'react';
import { Grid, Typography, Link, ListItem, Box } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItemText from '@material-ui/core/ListItemText';

interface Props {
  cargoDetails: CargoDetailCargoDetail[];
}

const QuoteItemCargoDetail: React.FC<Props> = ({ cargoDetails }) => (
  <Grid item xs={12}>
    <Typography variant="subtitle2">
      <Box display="inline" alignItems="center" fontWeight="fontWeightBold">
        Cargo details:
      </Box>
    </Typography>
    <Typography variant="body2">
      <List dense={true}>
        {cargoDetails.map((cargoDetail: CargoDetailCargoDetail) => (
          <ListItem>
            <ListItemText primary={`${cargoDetail.Quantity} – ${cargoDetail.CtypID}`} />
          </ListItem>
        ))}
      </List>
    </Typography>
    <Divider />
  </Grid>
);

export default QuoteItemCargoDetail;
