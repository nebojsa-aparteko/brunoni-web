import React, { Fragment, useContext } from 'react';
import { Box, Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

import SpecialOffer from './SpecialOffer';
import SpecialOffers from '../contexts/SpecialOffers';

export default () => {
  const specialOffers = useContext(SpecialOffers);

  if (!specialOffers || specialOffers.length < 1) {
    return null;
  }

  return (
    <Fragment>
      <Box py={3} mb={2}>
        <Box mb={0.5}>
          <Typography variant="h2">SAVE WITH SHIPPING</Typography>
        </Box>
        <Typography variant="subtitle1" style={{ opacity: 0.5 }}>
          CHECK OUT {specialOffers.length === 1 ? 'THIS SPECIAL OFFER' : 'THESE SPECIAL OFFERS'} BY OUR PARTNER
          CARRIERS.
        </Typography>
      </Box>
      <Grid container spacing={3}>
        {specialOffers.map(specialOffer => (
          <Grid item md={4} xs={12} key={specialOffer.id}>
            <SpecialOffer {...specialOffer} />
          </Grid>
        ))}
      </Grid>
    </Fragment>
  );
};
