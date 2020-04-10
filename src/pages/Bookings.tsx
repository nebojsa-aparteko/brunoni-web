import React, { Fragment } from 'react';
import BookingsView from '../components/Bookings';
import Container from '@material-ui/core/Container';
import { makeStyles, Theme } from '@material-ui/core';
import Meta from '../components/Meta';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },
}));

const Bookings: React.FC = () => {
  const classes = useStyles();

  return (
    <Fragment>
      <Meta title="Bookings" />
      <Container maxWidth="xl" className={classes.root}>
        <BookingsView />
      </Container>
    </Fragment>
  );
};

export default Bookings;
