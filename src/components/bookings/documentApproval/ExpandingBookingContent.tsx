import { Booking, Remark } from '../../../model/Booking';
import React, { useMemo } from 'react';
import SimpleExpansionPanel from '../../SimpleExpansionPanel';
import BookingSummary from '../BookingSummary';
import ContainerDetails from '../ContainerDetails';
import PortTerms from '../../../components/bookings/PortTerms';
import { isImport, isLongVersion } from '../BookingView';
import { Box, makeStyles } from '@material-ui/core';
import SpecialRemarks from '../SpecialRemarks';
import BookingFreight from '../BookingFreight';
import BookingRemarks from '../BookingRemarks';
import useUserByAlphacomId from '../../../hooks/useUserByAlphacomId';
import { flow } from 'lodash/fp';
import get from 'lodash/fp/get';
import filter from 'lodash/fp/filter';
import { remark } from '../BookingViewMainContent';

const mediaPrint = '@media print';
const useStyles = makeStyles(() => ({
  hidePrint: {
    [mediaPrint]: {
      display: 'none',
    },
  },
  showPrint: {
    [mediaPrint]: {
      display: 'initial',
    },
  },
}));

const ExpandingBookingContent = ({ booking, isPrintWithCost, initialFreightTab }: Props) => {
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
    <React.Fragment>
      <SimpleExpansionPanel label={'Booking Summary'}>
        <BookingSummary booking={booking} bookingAgent={bookingAgent} />
      </SimpleExpansionPanel>
      <SimpleExpansionPanel label={'Cargo Details'}>
        <ContainerDetails
          cargoDetail={booking.CargoDetails}
          version={booking.Version}
          category={booking?.Category}
          tariffDetails={booking?.CtrTariffsDetails}
          remarks={booking.Remarks}
        />
      </SimpleExpansionPanel>
      {isLongVersion(booking.Version) && !isImport(booking?.Category) ? (
        <SimpleExpansionPanel label={'Port Terms And Special Remarks'}>
          <Box display="flex" flexDirection="column">
            <Box marginTop="0em" marginBottom="0em">
              <PortTerms portTerms={booking.PortTerms} />
            </Box>
            <Box marginTop="0em" marginBottom="0em">
              <SpecialRemarks remarks={specialRemarks} />
            </Box>
          </Box>
        </SimpleExpansionPanel>
      ) : null}
      {booking.FreightDetails && (
        <Box marginTop="1em" marginBottom="1em" className={isPrintWithCost ? classes.showPrint : classes.hidePrint}>
          <BookingFreight freightDetails={booking.FreightDetails} initiallySelectedTab={initialFreightTab} />
        </Box>
      )}
      <BookingRemarks booking={booking} />
    </React.Fragment>
  );
};

interface Props {
  booking: Booking;
  isPrintWithCost?: boolean;
  initialFreightTab?: number;
}

export default ExpandingBookingContent;
