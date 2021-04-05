import { Box, Divider, makeStyles } from '@material-ui/core';
import React from 'react';
import Page from '../bookings/Page';
import { BookingRequest } from '../../model/BookingRequest';
import { getBookingRequestTitle } from './BookingRequestView';
import BookingRequestSummary from './BookingRequestSummary';
import InfoBoxItem from '../InfoBoxItem';
import ContainerDetails from '../onlineBooking/ContainerDetails';
import QuoteItemQuoteDetails from '../quotes/QuoteItemQuoteDetails';

export const remark = {
  special: 'SPECIAL REMARKS',
  final: 'FINAL REMARKS',
};

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
}));
const BookingRequestViewMainContent = ({ bookingRequest, isPrintWithCost }: Props) => {
  const classes = useStyles();

  return (
    <Page title={getBookingRequestTitle(bookingRequest)}>
      <Box id="bookingSummaryBkg" marginTop="1em" marginBottom="0em">
        <BookingRequestSummary bookingRequest={bookingRequest} />
      </Box>
      <Box marginTop="0em" marginBottom="0em">
        {bookingRequest.containers && (
          <>
            <Box marginTop="2em" marginBottom="2em">
              <Divider />
            </Box>
            <ContainerDetails containers={bookingRequest.containers} bookingRequest={bookingRequest} />
          </>
        )}
      </Box>
      {bookingRequest.freightDetails && (
        <Box marginTop="0em" marginBottom="0em">
          <QuoteItemQuoteDetails quoteDetails={bookingRequest.freightDetails} hideRemarks={true} />
        </Box>
      )}
      <Box id="otherBookingInfoBkg">
        {bookingRequest.additionalInfo && (
          <>
            <Box marginTop="2em" marginBottom="2em">
              <Divider />
            </Box>
            <InfoBoxItem title="Additional Info" label1={bookingRequest.additionalInfo} gutterBottom />
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
