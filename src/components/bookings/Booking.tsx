import React, { useContext, useEffect, Fragment } from 'react';
import { Box, Button, Container, Divider, Grid, makeStyles, Paper, Theme, Typography } from '@material-ui/core';
import PrintIcon from '@material-ui/icons/Print';
import Page from './Page';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import Bookings from '../../contexts/Bookings';
import { Booking as BookingModel, Remark, BookingVersion } from '../../model/Booking';
import QuoteNav from '../quotes/QuoteItemNav';
import BookingSummary from './BookingSummary';
import ContainerDetails from './ContainerDetails';
import BookingFreight from './BookingFreight';
import PortTerms from './PortTerms';
import SpecialRemarks from './SpecialRemarks';

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
  return booking?.CarrierID.toUpperCase();
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

const remark = {
  special: 'SPECIAL REMARKS',
  final: 'FINAL REMARKS',
};

export const isLongVersion = (version: BookingVersion) => {
  return version === 'Long';
};

const Booking: React.FC<Props> = ({ id }) => {
  const bookings = useContext(Bookings);
  const booking = bookings?.find(booking => booking.id === id);
  const bookingTitle = getBookingTitle(booking) || '';
  const classes = useStyles();

  let specialRemarks: Remark[] = [];
  let finalRemarks: Remark[] = [];

  if (!booking) {
    return (
      <Container maxWidth="lg">
        <Paper className={classes.root}>
          <ChartsCircularProgress />
        </Paper>
      </Container>
    );
  }

  console.log(booking);

  if (booking.Remarks) {
    booking.Remarks.Remark.forEach(remarkItem => {
      if (remarkItem.RemarkType === remark.special) {
        specialRemarks.push(remarkItem);
      } else if (remarkItem.RemarkType === remark.final) {
        finalRemarks.push(remarkItem);
      }
    });
  }

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
            <QuoteNav backTo="/bookings" subtitle={`File No. ${booking.id}`} title={`Booking - ${bookingTitle}`} />
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
              <Box marginTop="2em" marginBottom="2em">
                <BookingSummary booking={booking} />
              </Box>

              <Box marginTop="2em" marginBottom="2em">
                <ContainerDetails cargoDetail={booking.CargoDetails.CargoDetail} version={booking.Version} />
              </Box>

              {isLongVersion(booking.Version) ? (
                <Fragment>
                  <Box marginTop="2em" marginBottom="2em">
                    <PortTerms portTerms={booking.PortTerms} />
                  </Box>

                  <Box marginTop="2em" marginBottom="2em">
                    <SpecialRemarks remarks={specialRemarks} />
                  </Box>
                </Fragment>
              ) : null}

              {booking.FreightDetails && booking.FreightDetails.FreightDetail && (
                <Box marginTop="2em" marginBottom="2em">
                  <BookingFreight freightDetails={booking.FreightDetails.FreightDetail} />
                </Box>
              )}

              {finalRemarks.map((item, index) => {
                return (
                  <Typography variant="body2" key={`final-remark-${index}`}>
                    <span dangerouslySetInnerHTML={{ __html: item.RemarkTxt }} />
                  </Typography>
                );
              })}
            </Page>
          </Grid>
        </Paper>
      </Container>
    </Page>
  );
};

export default Booking;
