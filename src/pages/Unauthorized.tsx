import React from 'react';
import { makeStyles, Typography, Grid, createStyles } from '@material-ui/core';
import Link from '../components/Link';
import { Error } from '../components/Illustrations';
import LoginWidget from '../components/LoginWidget';

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
        <Typography variant="h6">401 Unauthorized</Typography>
        <Typography gutterBottom>You have to be logged in to view this page.</Typography>
        <Grid container spacing={2} alignItems="baseline">
          <Grid item>
            <LoginWidget />
          </Grid>
          <Grid item>
            <Link to="/" replace>
              Go Home
            </Link>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default NotFound;
