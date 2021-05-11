import React from 'react';
import { Box, Grid } from '@material-ui/core';
import Image from 'material-ui-image';
import Typography from '@material-ui/core/Typography';
import empty from '../../assets/state.server.overload.svg';

import Container from '../Container';

export default () => (
  <Container>
    <Grid container justify="center" alignItems="center">
      <Grid item md={6}>
        <Box p={6} textAlign="center">
          <Image src={empty} aspectRatio={16 / 9} color="transparent" disableSpinner />
          <Typography variant="h5" gutterBottom>
            <Box fontWeight="fontWeightBold">Search Voyages</Box>
          </Typography>
          <Typography variant="subtitle1">
            To see the voyages that are best for you, please input origin, destination and earliest date of departure
            and click "Search"
          </Typography>
        </Box>
      </Grid>
    </Grid>
  </Container>
);
