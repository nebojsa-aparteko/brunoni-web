import { Box, Divider, makeStyles } from '@material-ui/core';
import BookingSummary from './BookingSummary';
import ContainerDetails from './ContainerDetails';
import React, { Fragment, useMemo } from 'react';
import { Booking, Remark } from '../../model/Booking';
import PortTerms from './PortTerms';
import SpecialRemarks from './SpecialRemarks';
import BookingFreight from './BookingFreight';
import Page from './Page';
import { getBookingTitle, isImport, isLongVersion } from './BookingView';
import flow from 'lodash/fp/flow';
import get from 'lodash/fp/get';
import filter from 'lodash/fp/filter';
import useUserByAlphacomId from '../../hooks/useUserByAlphacomId';
import BookingRemarks from './BookingRemarks';

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
const BookingViewMainContent = ({ booking, isPrintWithCost }: Props) => {
  const bookingAgent = useUserByAlphacomId(booking?.BkgAgentContact || undefined);
  const classes = useStyles();

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

  return (
    <Page title={getBookingTitle(booking)}>
      <Box id="bookingSummaryBkg" marginTop="1em" marginBottom="0em">
        <BookingSummary booking={booking} bookingAgent={bookingAgent} />
      </Box>
      <Box marginTop="0em" marginBottom="0em">
        <Box marginTop="2em" marginBottom="2em">
          <Divider />
        </Box>
        <ContainerDetails
          cargoDetail={booking.CargoDetails}
          version={booking.Version}
          category={booking?.Category}
          tariffDetails={booking?.CtrTariffsDetails}
          remarks={booking.Remarks}
        />
      </Box>
      <Box id="otherBookingInfoBkg">
        {isLongVersion(booking.Version) && !isImport(booking?.Category) ? (
          <Fragment>
            <Box id="portTermsBkg" marginTop="0em" marginBottom="0em">
              <PortTerms portTerms={booking.PortTerms} />
            </Box>
            <Box marginTop="0em" marginBottom="0em">
              <SpecialRemarks remarks={specialRemarks} />
            </Box>
          </Fragment>
        ) : null}

        {booking.FreightDetails && (
          <Box marginTop="0em" marginBottom="0em" className={isPrintWithCost ? classes.showPrint : classes.hidePrint}>
            <BookingFreight freightDetails={booking.FreightDetails} />
          </Box>
        )}
        <Box style={{ paddingTop: '10px', textAlign: 'justify' }}>
          <BookingRemarks booking={booking} />
        </Box>
      </Box>
    </Page>
  );
};

interface Props {
  booking: Booking;
  isPrintWithCost: boolean;
}

export default BookingViewMainContent;
