import React, { useContext, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  makeStyles,
  Paper,
  Theme
} from '@material-ui/core';
import PrintIcon from '@material-ui/icons/Print';
import Page from './Page';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import Bookings from '../../contexts/Bookings';
import { Booking as BookingModel } from '../../model/Booking';
import QuoteNav from '../quotes/QuoteItemNav';
import BookingSummary from './BookingSummary';
import BookingContainers from './BookingContainers';
import BookingFreight from './BookingFreight';
import PortTerms from './PortTerms';

const useStyles = makeStyles((theme: Theme) => ({
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
  title: {
    fontSize: '1.2em',
  },
  actionBar: {
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
    ['@media print']: {
      marginBottom: theme.spacing(0),
    },
  },
  actions: {
    '& > *': {
      marginLeft: theme.spacing(1),
    },
  },
  hidePrint: {
    ['@media print']: {
      display: 'none',
    },
  },
}));

interface Props {
  id: string;
}

const getBookingTitle = (booking: BookingModel | undefined) => {
  return booking?.CarrierID;
};

function ScrollToTopOnMount() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return null;
}

const handlePrint = () => {
  window.print();
};

const Booking: React.FC<Props> = ({ id }) => {
  const bookings = useContext(Bookings);
  const booking = bookings?.find(booking => booking.id === id);
  const bookingTitle = getBookingTitle(booking) || '';
  const classes = useStyles();

  if( !booking ) {
    return (
      <Container maxWidth="lg">
        <Paper className={classes.root}>
          <ChartsCircularProgress />
        </Paper>
      </Container>
    );
  }

  console.log(booking);

  return (
    <Page title={bookingTitle}>
      <Container maxWidth="lg">
        <ScrollToTopOnMount />

        <Paper className={classes.root}>
          <Box display="none" displayPrint="block" mb={2}>
            <Box mb={2}>
              {/* <img
                src={require(`../assets/logo.${process.env.REACT_APP_BRAND}.png`)}
                alt={changeCase.titleCase(process.env.REACT_APP_BRAND || '')}
                style={{ width: '5em' }}
              /> */}
            </Box>
            <Divider />
          </Box>

          <Box className={classes.actionBar} mb={2} display="flex" alignItems="end" justifyContent="space-between">
            <QuoteNav
              backTo='/bookings'
              subtitle={`ID ${booking.id}`}
              title={`Booking - ${bookingTitle}`}
            />
            <Box className={classes.actions} displayPrint="none">
              <Button
                aria-label="print"
                variant="outlined"
                size="small"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
              >
                Print
              </Button>
            </Box>
          </Box>

          <Grid item xs={12}>
            <Page title={bookingTitle}>

              <Grid container spacing={2}>
                <Grid item md={6} xs={12}>
                  <BookingSummary booking={booking} />
                </Grid>
                <Grid item md={6} xs={12}>
                  <BookingContainers cargoDetail={booking.CargoDetails.CargoDetail} />
                </Grid>
              </Grid>

              <Box marginTop="1em" marginBottom="1em">
                <BookingFreight freightDetails={booking.FreightDetails.FreightDetail} />
              </Box>

              <Box marginTop="1em" marginBottom="1em">
                <PortTerms portTerms={booking.PortTerms} />
              </Box>
            </Page>
          </Grid>
        </Paper>
      </Container>
    </Page>
  );
};

export default Booking;
