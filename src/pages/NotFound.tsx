import React from 'react';
import { Typography, Grid, Box, Button, Container } from '@material-ui/core';
import Link from '../components/Link';
import Image from 'material-ui-image/lib/components/Image/Image';
import notFound from '../assets/state.notfound.svg';

const NotFound: React.FC = () => (
  <Container>
    <Grid container justify="center" alignItems="center">
      <Grid item md={6}>
        <Box p={6} textAlign="center">
          <Image src={notFound} aspectRatio={16 / 9} color="transparent" disableSpinner />
          <Typography variant="h5" gutterBottom>
            <Box fontWeight="fontWeightBold">404 Page Not Found</Box>
          </Typography>
          <Typography variant="subtitle1">
            Make sure you have the right address or visit home page.
          </Typography>
          <Box p={2} display="flex" justifyContent="center">
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
