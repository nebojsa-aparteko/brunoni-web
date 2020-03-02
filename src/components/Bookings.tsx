import React, { Fragment, useContext } from 'react';
import {
  makeStyles,
  Container as MUIContainer,
  Paper,
  Card,
  CardContent
} from '@material-ui/core';
import Meta from './Meta';
import BookingsContext from '../contexts/Bookings';
import ChartsCircularProgress from './dashboard/ChartsCircularProgress';
import BookingsTable from './bookings/BookingsTable';

interface Props {
  showCompanyInfo?: boolean;
}

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    padding: theme.spacing(5),

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
      paddingTop: theme.spacing(3),
    },

    ['@media print']: {
      marginTop: theme.spacing(0),
      paddingTop: theme.spacing(0),
    },
  },
  content: {
    padding: 0,
    overflowX: 'auto',
  },
  inner: {
    minWidth: 700,
  },
  nameCell: {
    display: 'flex',
    alignItems: 'center',
  },
  avatar: {
    height: 42,
    width: 42,
    marginRight: theme.spacing(1),
  },
  actions: {
    padding: theme.spacing(1),
    justifyContent: 'flex-end',
  },
}));

const Bookings: React.FC<Props> = ({ showCompanyInfo }) => {
  const classes = useStyles();
  const bookings = useContext(BookingsContext);

  if ( !bookings ) {
    return (
      <MUIContainer maxWidth="lg">
        <Paper className={classes.root}>
          <ChartsCircularProgress />
        </Paper>
      </MUIContainer>
    );
  }

  return (
    <Fragment>
      <Meta title={'Bookings'} />
      <Card>
        <CardContent className={classes.content}>
          <BookingsTable bookings={bookings} showCompanyInfo={showCompanyInfo} />
        </CardContent>
      </Card>
    </Fragment>
  );
};

export default Bookings;
