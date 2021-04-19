import { Box, Button, Divider, makeStyles, Typography } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import Page from '../bookings/Page';
import { BookingRequest } from '../../model/BookingRequest';
import { getBookingRequestTitle } from './BookingRequestView';
import BookingRequestSummary from './BookingRequestSummary';
import InfoBoxItem from '../InfoBoxItem';
import ContainerDetails from '../onlineBooking/ContainerDetails';
import QuoteItemQuoteDetails from '../quotes/QuoteItemQuoteDetails';
import BookingRequestClosings from './BookingRequestClosings';
import BookingRequestPortTerms from './BookingRequestPortTerms';
import BookingRequestSpecialRemark from './BookingRequestSpecialRemark';
import firebase from '../../firebase';
import { GlobalContext } from '../../store/GlobalStore';
import { useSnackbar } from 'notistack';

const useStyles = makeStyles(() => ({
  hidePrint: {
    ['@media print']: {
      display: 'none',
    },
  },
  showPrint: {
    ['@media print']: {
      display: 'initial',
    },
  },
  additionalInfo: {
    whiteSpace: 'pre-wrap',
  },
  remark: {
    whiteSpace: 'pre-wrap',
    marginTop: 8,
  },
}));

const updateBookingRequest = async (bookingRequest: BookingRequest) => {
  bookingRequest.id &&
    (await firebase
      .firestore()
      .collection('booking-requests')
      .doc(bookingRequest.id)
      .set(bookingRequest, { merge: true }));
};

const remark =
  'FOR FCL BOOKINGS ONLY:WITH RECEIPT OF THIS BOOKING CONFIRMATION, THE SHIPPER OR OTHER CARGO INTERESTED PARTY UNDERTAKES TO SEAL THE CONTAINER(S) WITH HIGH-SECURITY SEAL(S) (MEETING THE SPECIFICATIONS OF ISO/PAS 17712DD. JANUARY 17,2003) IMMEDIATELY AFTER STUFFING IS COMPLETED AND BEFORE IT IS DELIVERED TO US AND,AS PART OF THE SHIPPING INSTRUCTIONS, TO FORWARD THE SEAL NUMBER TOGETHER WITH THE PRECISE CONTENTS OF THE CONTAINER TO THE CARRIER.\n' +
  '\n' +
  'BOOKING AND SHIPMENT SUBJECT TO CONDITIONS AS PRINTED ON THE BILL OF LADING. ANY REQUIREMENTS/INSTRUCTIONS WHICH ARE CONTRADICTORY TO THE B/L CLAUSES ARE NOT VALID UNLESS CONFIRMED BY US IN WRITING.';

const BookingRequestViewMainContent = ({ bookingRequest, isPrintWithCost }: Props) => {
  const [bookingRequestState, setBookingRequestState] = useState<BookingRequest>(bookingRequest);
  const [editing, setEditing] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();
  const [, dispatch] = useContext(GlobalContext);
  const classes = useStyles();

  const handleCancelEditing = () => {
    setBookingRequestState(bookingRequest);
    setEditing(false);
  };

  useEffect(() => {
    setBookingRequestState(bookingRequest);
  }, [bookingRequest]);

  const handleSave = () => {
    dispatch({ type: 'START_GLOBAL_LOADING' });
    updateBookingRequest(bookingRequestState)
      .then(() => {
        setEditing(false);
        enqueueSnackbar(<Typography color="inherit">Saved changes!</Typography>, {
          variant: 'success',
          autoHideDuration: 1500,
        });
      })
      .catch(error => {
        console.error('error saving booking request', error);
        enqueueSnackbar(<Typography color="inherit"> {error.message}!</Typography>, {
          variant: 'error',
          autoHideDuration: 3000,
        });
      })
      .finally(() => {
        dispatch({ type: 'STOP_GLOBAL_LOADING' });
      });
  };

  return (
    <Page title={getBookingRequestTitle(bookingRequestState)}>
      <Button
        color={editing ? undefined : 'primary'}
        variant="contained"
        onClick={editing ? handleCancelEditing : () => setEditing(true)}
      >
        {editing ? 'Cancel' : 'Edit Booking Request'}
      </Button>
      {editing && (
        <Button color={'primary'} variant="contained" onClick={handleSave} style={{ marginLeft: '1em' }}>
          Save changes
        </Button>
      )}
      <Box id="bookingSummaryBkg" marginTop="1em" marginBottom="0em">
        <BookingRequestSummary
          bookingRequest={bookingRequestState}
          setBookingRequest={setBookingRequestState}
          editing={editing}
        />
      </Box>
      <Box marginTop="0em" marginBottom={editing ? '2em' : '0em'}>
        {bookingRequestState.containers && (
          <>
            <Box marginTop="2em" marginBottom="2em">
              <Divider />
            </Box>
            <ContainerDetails
              containers={bookingRequestState.containers}
              bookingRequest={bookingRequestState}
              setBookingRequest={setBookingRequestState}
              editing={editing}
            />
          </>
        )}
      </Box>
      <BookingRequestPortTerms bookingRequest={bookingRequestState} />
      {bookingRequestState.schedule?.Deadlines && <BookingRequestClosings bookingRequest={bookingRequestState} />}
      <BookingRequestSpecialRemark
        bookingRequest={bookingRequestState}
        setBookingRequest={setBookingRequestState}
        editing={editing}
      />
      {bookingRequestState.freightDetails && (
        <>
          <Box marginTop="2em" marginBottom="2em">
            <Divider />
          </Box>
          <QuoteItemQuoteDetails quoteDetails={bookingRequestState.freightDetails} hideRemarks={true} />
          <Typography variant="body2" className={classes.remark}>
            {remark}
          </Typography>
        </>
      )}
      <Box id="otherBookingRequestInfo">
        {bookingRequestState.additionalInfo && (
          <>
            <Box marginTop="2em" marginBottom="2em">
              <Divider />
            </Box>
            <InfoBoxItem
              title="Additional Info"
              label1={<Typography className={classes.additionalInfo}>{bookingRequestState.additionalInfo}</Typography>}
              gutterBottom
            />
          </>
        )}
      </Box>
    </Page>
  );
};

interface Props {
  bookingRequest: BookingRequest;
  isPrintWithCost: boolean;
}

export default BookingRequestViewMainContent;
