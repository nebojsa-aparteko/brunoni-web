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

const BookingsAdmin: React.FC = () => {
  const classes = useStyles();

  return (
    <Fragment>
      <Meta title="Bookings" />
      <Container maxWidth="lg" className={classes.root}>
        <BookingsView showCompanyInfo />
      </Container>
    </Fragment>
  );
};

export default BookingsAdmin;
