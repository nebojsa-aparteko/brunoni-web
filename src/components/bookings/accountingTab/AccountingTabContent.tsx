import { Box, Container, Typography } from '@material-ui/core';
import React from 'react';
import { Booking } from '../../../model/Booking';
import ChartsCircularProgress from '../../dashboard/ChartsCircularProgress';
import usePaymentOverview from '../../../hooks/usePaymentOverview';
import AccountingWeeklyPayment from './AccountingWeeklyPayment';
import WeeklyPayment from '../../../model/WeeklyPayment';

const AccountingTabContent = ({ booking }: AccountingTabContentProps) => {
  const weeklyPayments = usePaymentOverview(booking.id) as WeeklyPayment[];

  if (!weeklyPayments) {
    return (
      <Container>
        <ChartsCircularProgress />
      </Container>
    );
  }

  return (
    <Box display="flex" flex={1} flexDirection="column" px={0} style={{ listStyle: 'none' }}>
      {weeklyPayments.length > 0 ? (
        weeklyPayments.map(payment => (
          <AccountingWeeklyPayment key={payment.reference} payment={payment} booking={booking} />
        ))
      ) : (
        <Box flex={1} p={2}>
          <Typography>There are currently no weekly payments for this booking.</Typography>
        </Box>
      )}
    </Box>
  );
};

interface AccountingTabContentProps {
  booking: Booking;
}

export default AccountingTabContent;
