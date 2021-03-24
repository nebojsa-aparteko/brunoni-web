import { Box, Divider, makeStyles, Typography } from '@material-ui/core';
import { Remark } from '../../model/Booking';
import React, { Fragment, useMemo } from 'react';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import filter from 'lodash/fp/filter';
import Page from '../bookings/Page';
import { isImport, isLongVersion } from '../bookings/BookingView';
import BookingSummary from '../bookings/BookingSummary';
import ContainerDetails from '../bookings/ContainerDetails';
import SpecialRemarks from '../bookings/SpecialRemarks';
import BookingFreight from '../bookings/BookingFreight';
import BookingRemarks from '../bookings/BookingRemarks';
import PortTermsDetails from '../bookings/PortTerms';
import { BookingRequest } from '../../model/BookingRequest';
import { getBookingRequestTitle } from './BookingRequestView';
import BookingRequestSummary from './BookingRequestSummary';
import useUser from '../../hooks/useUser';
import { DateFormats, formatDateSafe } from '../../utilities/formattingHelpers';
import invoke from 'lodash/fp/invoke';

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
  // const bookingAgent = useUserByAlphacomId(bookingRequest?.BkgAgentContact || undefined);
  const classes = useStyles();
  const [, userRecord] = useUser();

  const specialRemarks: Remark[] = useMemo(
    () =>
      bookingRequest
        ? flow(
            get('Remarks'),
            filter((item: Remark) => item.RemarkType === remark.special),
          )(bookingRequest)
        : [],
    [bookingRequest],
  );

  return (
    <Page title={getBookingRequestTitle(bookingRequest)}>
      <Box id="bookingSummaryBkg" marginTop="1em" marginBottom="0em">
        <BookingRequestSummary bookingRequest={bookingRequest} bookingAgent={userRecord} />
      </Box>
      <Box marginTop="0em" marginBottom="0em">
        <Box marginTop="2em" marginBottom="2em">
          <Divider />
        </Box>
        {bookingRequest.containers?.map(container => (
          <Typography>
            {`${container.quantity} x ${container.containerType?.description} - ${container.commodityType?.name} (${
              container.pickupLocation?.city
            }, ${container.pickupLocation?.countryCode} - ${formatDateSafe(
              invoke('toDate')(container.pickupDate),
              DateFormats.LONG,
            )})`}
          </Typography>
        ))}
        {/*<ContainerDetails*/}
        {/*  cargoDetail={bookingRequest.containers}*/}
        {/*  version={bookingRequest.Version}*/}
        {/*  category={bookingRequest?.Category}*/}
        {/*  tariffDetails={bookingRequest?.CtrTariffsDetails}*/}
        {/*  remarks={bookingRequest.Remarks}*/}
        {/*/>*/}
      </Box>
      <Box id="otherBookingInfoBkg">
        {/*{isLongVersion(bookingRequest.Version) && !isImport(bookingRequest?.Category) ? (*/}
        {/*  <Fragment>*/}
        {/*    <Box id="portTermsBkg" marginTop="0em" marginBottom="0em">*/}
        {/*      <PortTermsDetails portTerms={bookingRequest.PortTerms} />*/}
        {/*    </Box>*/}
        {/*    <Box marginTop="0em" marginBottom="0em">*/}
        {/*      <SpecialRemarks remarks={specialRemarks} />*/}
        {/*    </Box>*/}
        {/*  </Fragment>*/}
        {/*) : null}*/}

        {/*{bookingRequest.FreightDetails && (*/}
        {/*  <Box marginTop="0em" marginBottom="0em" className={isPrintWithCost ? classes.showPrint : classes.hidePrint}>*/}
        {/*    <BookingFreight freightDetails={bookingRequest.FreightDetails} />*/}
        {/*  </Box>*/}
        {/*)}*/}
        {/*<Box style={{ paddingTop: '10px', textAlign: 'justify' }}>*/}
        {/*  <BookingRemarks booking={bookingRequest} />*/}
        {/*</Box>*/}
      </Box>
    </Page>
  );
};

interface Props {
  bookingRequest: BookingRequest;
  isPrintWithCost: boolean;
}

export default BookingRequestViewMainContent;
