import { Box, Divider, makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import Page from '../bookings/Page';
import { getBookingRequestTitle } from './BookingRequestView';
import BookingRequestSummary from './BookingRequestSummary';
import ContainerDetails from '../onlineBooking/ContainerDetails';
import BookingRequestClosings from './BookingRequestClosings';
import BookingRequestPortTerms from './BookingRequestPortTerms';
import BookingRequestSpecialRemarks from './BookingRequestSpecialRemarks';
import BookingRequestFreightDetails from './BookingRequestFreightDetails';
import { useBookingRequestContext } from '../../providers/BookingRequestProvider';
import SimpleExpansionPanel from '../SimpleExpansionPanel';

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

const remark =
  'FOR FCL BOOKINGS ONLY: WITH RECEIPT OF THIS BOOKING CONFIRMATION, THE SHIPPER OR OTHER CARGO INTERESTED PARTY UNDERTAKES TO SEAL THE CONTAINER(S) WITH HIGH-SECURITY SEAL(S) (MEETING THE SPECIFICATIONS OF ISO/PAS 17712DD. JANUARY 17,2003) IMMEDIATELY AFTER STUFFING IS COMPLETED AND BEFORE IT IS DELIVERED TO US AND,AS PART OF THE SHIPPING INSTRUCTIONS, TO FORWARD THE SEAL NUMBER TOGETHER WITH THE PRECISE CONTENTS OF THE CONTAINER TO THE CARRIER.\n' +
  '\n' +
  'BOOKING AND SHIPMENT SUBJECT TO CONDITIONS AS PRINTED ON THE BILL OF LADING. ANY REQUIREMENTS/INSTRUCTIONS WHICH ARE CONTRADICTORY TO THE B/L CLAUSES ARE NOT VALID UNLESS CONFIRMED BY US IN WRITING.';

const BookingRequestViewMainContent = ({ isPrintWithCost }: Props) => {
  const classes = useStyles();
  const [bookingRequestState, setBookingRequestState, editing] = useBookingRequestContext();

  return bookingRequestState ? (
    <Page title={getBookingRequestTitle(bookingRequestState)}>
      <SimpleExpansionPanel label={'Booking Request Summary'}>
        <BookingRequestSummary editing={editing} />
      </SimpleExpansionPanel>
      <SimpleExpansionPanel label={'Cargo Details'}>
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
      </SimpleExpansionPanel>
      <SimpleExpansionPanel label={'Port Terms, Closings And Special Remarks'}>
        <Box flex={1} display="flex" flexDirection="column">
          <BookingRequestPortTerms />

          <BookingRequestClosings />

          <BookingRequestSpecialRemarks />
        </Box>
      </SimpleExpansionPanel>

      <Box marginTop="2em" marginBottom="2em">
        <Divider />
      </Box>
      <BookingRequestFreightDetails freightDetails={bookingRequestState.freightDetails} />
      <Typography variant="body2" className={classes.remark}>
        {remark}
      </Typography>
    </Page>
  ) : null;
};

interface Props {
  isPrintWithCost: boolean;
}

export default BookingRequestViewMainContent;
