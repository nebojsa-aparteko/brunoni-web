import React, { useContext, useEffect, Fragment, useMemo } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Theme,
  Typography,
} from '@material-ui/core';
import filter from 'lodash/fp/filter';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import PrintIcon from '@material-ui/icons/Print';
import Page from './Page';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import Bookings from '../../contexts/Bookings';
import { Booking, Remark, BookingVersion } from '../../model/Booking';
import QuoteNav from '../quotes/QuoteItemNav';
import BookingSummary from './BookingSummary';
import ContainerDetails from './ContainerDetails';
import BookingFreight from './BookingFreight';
import PortTerms from './PortTerms';
import SpecialRemarks from './SpecialRemarks';
import CheckList from './checklist/CheckList';
import VisibilityIcon from '@material-ui/icons/Visibility';

const useStyles = makeStyles((theme: Theme) => ({
  body: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),

    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2),
      paddingTop: theme.spacing(3),
    },

    ['@media print']: {
      marginTop: theme.spacing(0),
      paddingTop: theme.spacing(0),
    },
  },
  root: {
    padding: theme.spacing(3),

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
  tableWrapper: {
    overflowX: 'auto',
    ['@media print']: {
      width: '30%',
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
  booking?: Booking;
}

const getBookingTitle = (booking?: Booking) => {
  return booking?.CarrierID.toUpperCase() || '';
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

const BookingView: React.FC<Props> = ({ booking }) => {
  const classes = useStyles();
  const agentMail = booking?.BkgAgentContactEml;
  const agent = booking?.BkgAgentContactTxt;
  const specialRemarks: Remark[] = useMemo(
    () =>
      booking
        ? flow(
            get('Remarks'),
            filter((item: Remark) => item.RemarkType === remark.special),
          )(booking)
        : [],
    [booking],
  );
  const finalRemarks: Remark[] = useMemo(
    () =>
      booking
        ? flow(
            get('Remarks'),
            filter((item: Remark) => item.RemarkType === remark.final),
          )(booking)
        : [],
    [booking],
  );

  if (!booking) {
    return (
      <Container maxWidth="lg">
        <Paper className={classes.root}>
          <ChartsCircularProgress />
        </Paper>
      </Container>
    );
  }
  const handleWatch = () => {};
  console.log('booking ', booking);
  return (
    <Grid container direction="row" spacing={2} justify="center" alignItems="flex-start" className={classes.body}>
      <Grid item md={7} xs={12}>
        <Page title={getBookingTitle(booking)}>
          <ScrollToTopOnMount />
          <Paper className={classes.root}>
            <Box display="none" displayPrint="block" mb={2}>
              <Box mb={2}>
                {/* <img
                  src={require(`../assets/logo.${process.env.REACT_APP_BRAND}.png`)}
                  alt={changeCase.capitalCase(process.env.REACT_APP_BRAND || '')}
                  style={{ width: '5em' }}
                /> */}
              </Box>
              <Divider />
            </Box>

            <Box className={classes.actionBar} mb={2} display="flex" alignItems="end" justifyContent="space-between">
              <QuoteNav
                backTo="/bookings"
                subtitle={`File No. ${booking.id}`}
                title={`Booking - ${getBookingTitle(booking)}`}
              />
              <Typography>
                <span>{agentMail ? <a href={'mailto:' + agentMail}>{agentMail}</a> : { agent }}</span>
              </Typography>
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
              <IconButton color="primary" aria-label="Watch" component="span" onClick={handleWatch}>
                <VisibilityIcon />
              </IconButton>
            </Box>

            <Grid item xs={12}>
              <Page title={getBookingTitle(booking)}>
                <Box marginTop="1em" marginBottom="0em">
                  <BookingSummary booking={booking} />
                </Box>
                <Box marginTop="0em" marginBottom="0em">
                  <ContainerDetails cargoDetail={booking.CargoDetails} version={booking.Version} />
                </Box>
                {isLongVersion(booking.Version) ? (
                  <Fragment>
                    <Box marginTop="0em" marginBottom="0em">
                      <PortTerms portTerms={booking.PortTerms} />
                    </Box>
                    <Box marginTop="0em" marginBottom="0em">
                      <SpecialRemarks remarks={specialRemarks} />
                    </Box>
                  </Fragment>
                ) : null}

                {booking.FreightDetails && (
                  <Box marginTop="0em" marginBottom="0em">
                    <BookingFreight freightDetails={booking.FreightDetails} />
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
        </Page>
      </Grid>
      <Grid item md={4} xs={12}>
        <CheckList booking={booking} showCompanyInfo={true} />
      </Grid>
    </Grid>
  );
};

export default BookingView;
