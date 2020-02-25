import React, { useState, useContext, Fragment } from 'react';
import {
  Box,
  Container,
  Grid,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  makeStyles,
  Paper,
  Theme,
  Typography
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Meta from '../Meta';
import ChartsCircularProgress from '../dashboard/ChartsCircularProgress';
import Bookings from '../../contexts/Bookings';
import { Booking as BookingModel } from '../../model/Booking';
import QuoteNav from '../quotes/QuoteItemNav';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    padding: theme.spacing(3),
  },
  currencyCell: {
    textAlign: 'right',
  },
  tableScroll: {
    overflowX: 'auto',
  },
  title: {
    fontSize: '1.2em',
  },
  buttonContainer: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    border: 'none',
  },
  noBorder: {
    border: 'none',
  },
  costUnitCell: {
    paddingLeft: 0,
  },
  buttons: {
    '& > * + *': {
      marginLeft: theme.spacing(1),
    },
  },
  tableHead: {
    '& th': {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  },
  tableRow: {
    '& td, th': {
      whiteSpace: 'nowrap',
    },
    '& td': {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  },
  alternateCell: {
    backgroundColor: '#f1f6f8', // TODO figure out why theme overrides from ./theme
    // are in collision with the default Material UI theme.
  },
  borderCell: {
    borderLeft: `1px solid ${theme.palette.divider}`,
  },
}));

interface Props {
  id: string;
}

const getBookingTitle = (booking: BookingModel | undefined) => {
  return booking?.CarrierID;
};

const Booking: React.FC<Props> = ({ id }) => {
  const [selectedPanel, setSelectedPanel] = useState('');
  const bookings = useContext(Bookings);
  const booking = bookings?.find(booking => booking.id === id);
  const bookingTitle = getBookingTitle(booking) || '';
  const classes = useStyles();

  const handlePanelClick = (bookingID: string) => {
    if (selectedPanel === bookingID) {
      setSelectedPanel('');
    } else {
      setSelectedPanel(bookingID);
      window.scrollTo(0, 150);
    }
  };

  if( !booking ) {
    return (
      <Container maxWidth="lg">
        <ChartsCircularProgress />
      </Container>
    );
  }

  // console.log(booking);

  return (
    <Fragment>
      <Meta title={bookingTitle} />
      <Container maxWidth="lg">
        <Box mt={6}>
          <QuoteNav
            backTo='/bookings'
            subtitle={`ID ${booking.id}`}
            title={`Booking - ${bookingTitle}`}
          />
        </Box>

        <Box mt={2} mb={2}>
          <Typography variant="body2">
            <strong>Vessel: </strong>{booking.Vessel}
          </Typography>
          <Typography variant="body2">
            <strong>Loading: </strong>{booking.PlaceOfRecieptName}
          </Typography>
          <Typography variant="body2">
            <strong>Dischg.: </strong>{booking.FinalDestinationName}
          </Typography>
          <Typography variant="body2">
            <strong>B/L-NO: </strong>{booking['BL-No']}
          </Typography>
          <Typography variant="body2">
            <strong>Volume: </strong>
          </Typography>
        </Box>

        <Box mb={6}>
          <Box id={id} mb={1}>
            <ExpansionPanel TransitionProps={{ unmountOnExit: true }} expanded={selectedPanel === id}>
              <ExpansionPanelSummary
                aria-controls="panel1c-content"
                expandIcon={<ExpandMoreIcon />}
                onClick={() => handlePanelClick(id)}
              >
                <Typography variant="h4">Item 1</Typography>
              </ExpansionPanelSummary>

              <ExpansionPanelDetails>
                <Grid container>
                  <Grid item xs={12}>
                    <Paper className={classes.tableScroll}>
                      Cargo details
                    </Paper>
                  </Grid>
                </Grid>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </Box>
        </Box>
      </Container>
    </Fragment>
  );
};

export default Booking;
