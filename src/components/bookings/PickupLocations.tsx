import React from 'react';
import { Grid } from '@material-ui/core';

interface Props {}

const PickupLocations: React.FC<Props> = () => {
  return (
    <Grid container spacing={2}>
      <Grid item md={6} xs={12}>
        PICK UP LOCATION/S: (no data)
      </Grid>
      <Grid item md={6} xs={12}>
        DELIVERY ADDRESS: (no data)
      </Grid>
    </Grid>

  );
};

export default PickupLocations;
