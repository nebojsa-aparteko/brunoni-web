import React from 'react';
import { Container, Typography, Grid, Box, Button } from '@material-ui/core';
import Link from '../components/Link';
import LoginWidget from '../components/LoginWidget';
import Image from 'material-ui-image/lib/components/Image/Image';
import errorImage from '../assets/state.error.svg';
const Unauthorized: React.FC = () => (
  <Container>
    <Grid container justify="center" alignItems="center">
      <Grid item md={6}>
        <Box p={6} display="flex" flexDirection="column" textAlign="center">
          <Image src={errorImage} aspectRatio={16 / 9} color="transparent" disableSpinner />
          <Typography variant="h4" style={{ fontWeight: 500 }}>
            You have to be logged in to view this page.
          </Typography>
          <Box p={2} display="flex" flexDirection="column" justifyContent="center">
            <Box mb={1}>
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

export default Unauthorized;
