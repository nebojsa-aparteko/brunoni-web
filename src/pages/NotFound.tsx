import React from 'react';
import { Typography, Grid, Box } from '@material-ui/core';
import Link from '../components/Link';
import { Error } from '../components/Illustrations';

const NotFound: React.FC = () => (
  <Box flex={4} display="flex">
    <Grid container justify="center" alignItems="center">
      <Grid item xs={2}>
        <Error />
        <Typography variant="h6">404 Page Not Found</Typography>
        <Link to="/" replace>
          Go Home
        </Link>
      </Grid>
    </Grid>
  </Box>
);

export default NotFound;
