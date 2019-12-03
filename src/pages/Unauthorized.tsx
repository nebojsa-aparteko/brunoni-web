import React from 'react';
import { Container, Typography, Grid, Box, Button } from '@material-ui/core';
import Link from '../components/Link';
import LoginWidget from '../components/LoginWidget';
import Image from 'material-ui-image/lib/components/Image/Image';

const NotFound: React.FC = () => (
  <Container>
    <Grid container justify="center" alignItems="center">
      <Grid item md={6}>
        <Box p={6} textAlign="center">
          <Image src={require(`../assets/state.error.svg`)} aspectRatio={16 / 9} color="transparent" disableSpinner />
          <Typography variant="h5" gutterBottom>
            <Box fontWeight="fontWeightBold">401 Unauthorized</Box>
          </Typography>
          <Typography variant="subtitle1">You have to be logged in to view this page.</Typography>
          <Box p={2} display="flex" justifyContent="center">
            <Box mr={2}>
              <LoginWidget />
            </Box>
            <Box>
              <Button component={Link} to="/" replace>
                Go to Homepage
              </Button>
            </Box>
          </Box>
        </Box>
      </Grid>
    </Grid>
  </Container>
);

export default NotFound;
