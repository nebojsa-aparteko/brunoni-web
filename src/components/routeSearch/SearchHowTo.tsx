import Container from '../Container';
import { Box, Grid } from '@material-ui/core';
import Image from 'material-ui-image';
import Typography from '@material-ui/core/Typography';
import React from 'react';

export default () => (
  <Container>
    <Grid container justify="center" alignItems="center">
      <Grid item md={6}>
        <Box p={6} textAlign="center">
          <Image
            src={require(`../../assets/state.server.overload.svg`)}
            aspectRatio={16 / 9}
            color="transparent"
            disableSpinner
          />
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
