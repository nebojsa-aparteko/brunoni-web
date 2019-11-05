import React from 'react';
import { makeStyles, Typography, Grid, createStyles } from '@material-ui/core';
import Link from '../components/Link';
import { Error } from '../components/Illustrations';

const useStyles = makeStyles(
  createStyles({
    '@global': {
      '#root': {
        justifyContent: 'center',
      },
    },
  }),
);

const NotFound: React.FC = () => {
  useStyles();

  return (
    <Grid container justify="center" alignItems="center">
      <Grid item xs={2}>
        <Error />
        <Typography variant="h6">404 Page Not Found</Typography>
        <Link to="/" replace>
          Go Home
        </Link>
      </Grid>
    </Grid>
  );
};

export default NotFound;
