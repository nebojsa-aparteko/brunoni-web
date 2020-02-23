import React, { Fragment, useContext } from 'react';
import {
  makeStyles,
  Container,
  Paper,
  Theme
} from '@material-ui/core';
import Meta from './Meta';
import BookingsContext from '../contexts/Bookings';
import ChartsCircularProgress from './dashboard/ChartsCircularProgress';
import BookingsTable from './BookingsTable';

interface Props {}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    padding: theme.spacing(3),
  }
}));

const Bookings: React.FC<Props> = () => {
  const classes = useStyles();
  const bookings = useContext(BookingsContext);

  if ( !bookings ) {
    return (
      <Container maxWidth="lg">
        <Paper className={classes.root}>
          <ChartsCircularProgress />
        </Paper>
      </Container>
    );
  }

  return (
    <Fragment>
      <Meta title={'Bookings'} />
      <Container maxWidth="lg">
        <Paper className={classes.root}>
          <BookingsTable data={bookings} />
        </Paper>
      </Container>
    </Fragment>
  );
};

export default Bookings;
