import { Box, Typography } from '@material-ui/core';
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

const remark = {
  special: 'SPECIAL REMARKS',
  final: 'FINAL REMARKS',
};

const BookingViewMainContent = ({ booking }: Props) => {
  const bookingAgent = useUserByAlphacomId(booking?.BkgAgentContact || undefined);

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

  return (
    <Page title={getBookingTitle(booking)}>
      <Box className="bookingSummary" marginTop="1em" marginBottom="0em">
        <BookingSummary booking={booking} bookingAgent={bookingAgent} />
      </Box>
      <Box className="bookingContainerDetails" marginTop="0em" marginBottom="0em">
        <ContainerDetails
          cargoDetail={booking.CargoDetails}
          version={booking.Version}
          category={booking?.Category}
          tariffDetails={booking?.CtrTariffsDetails}
          remarks={booking.Remarks}
        />
      </Box>
      {isLongVersion(booking.Version) && !isImport(booking?.Category) ? (
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
        <Box marginTop="0em" marginBottom="0em" displayPrint="none">
          <BookingFreight freightDetails={booking.FreightDetails} />
        </Box>
      )}
      <Box style={{ paddingTop: '10px', textAlign: 'justify' }}>
        {finalRemarks.map((item, index) => {
          const text = item.RemarkTxt.split('<br/><br/>'); // split the string into an array for each new paragraph

          return item.RemarkTxt ? (
            <Typography variant="body2" key={`final-remark-${index}`}>
              <span
                dangerouslySetInnerHTML={{
                  __html: text.map(remark => remark.split('<br/>').join('')).join('<br/><br/>'),
                }}
              />
              {/* remove all <br/> from the elements of the string array to get rid of manual new rows and join the elements, aka paragraphs with <br/><br/> as they were initially */}
            </Typography>
          ) : null;
        })}
      </Box>
    </Page>
  );
};

interface Props {
  booking: Booking;
}

export default BookingViewMainContent;
