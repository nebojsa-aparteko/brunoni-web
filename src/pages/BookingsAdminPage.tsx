import React, { Fragment, useContext } from 'react';
import BookingsView from '../components/Bookings';
import Container from '@material-ui/core/Container';
import { makeStyles, Theme } from '@material-ui/core';
import Meta from '../components/Meta';
import Bookings from '../contexts/Bookings';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },
}));

const BookingsAdminPage: React.FC = () => {
  const classes = useStyles();

  const bookings = useContext(Bookings);

  return (
    <Fragment>
      <Meta title="Bookings" />
      <Container maxWidth="xl" className={classes.root}>
        <BookingsView showCompanyInfo bookings={bookings || []} />
      </Container>
    </Fragment>
  );
};

export default BookingsAdminPage;
