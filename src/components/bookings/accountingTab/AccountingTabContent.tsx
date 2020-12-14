import { Box, Container, Divider, Typography } from '@material-ui/core';
import React from 'react';
import { Booking } from '../../../model/Booking';
import ChartsCircularProgress from '../../dashboard/ChartsCircularProgress';
import usePaymentOverview from '../../../hooks/usePaymentOverview';
import AccountingWeeklyPayment from './AccountingWeeklyPayment';
import WeeklyPayment from '../../../model/WeeklyPayment';
import useCommissions from '../../../hooks/useCommissions';
import Commission from '../../../model/Commission';
import AccountingCommission from './AccountingCommission';

const AccountingTabContent = ({ booking, updateComponent }: AccountingTabContentProps) => {
  const weeklyPayments = usePaymentOverview(booking.id) as WeeklyPayment[];
  const commissions = useCommissions(booking.id) as Commission[];

  if (!weeklyPayments || !commissions) {
    return (
      <Container>
        <ChartsCircularProgress />
      </Container>
    );
  }

  return (
    <Box display="flex" flex={1} flexDirection="column" px={0} style={{ listStyle: 'none' }}>
      {(weeklyPayments && weeklyPayments.length > 0) || (commissions && commissions.length > 0) ? (
        <React.Fragment>
          {weeklyPayments.map(payment => (
            <AccountingWeeklyPayment
              key={payment.reference}
              payment={payment}
              booking={booking}
              updateComponent={updateComponent}
            />
          ))}
          {weeklyPayments.length > 0 && commissions.length > 0 && <Divider style={{ margin: 8 }} />}
          {commissions.length > 0 && (
            <React.Fragment>
              <Typography variant="body2" style={{ margin: 6, marginTop: 0 }}>
                Commissions:
              </Typography>
              {commissions.map(commission => (
                <AccountingCommission key={commission.id} commission={commission} />
              ))}
            </React.Fragment>
          )}
        </React.Fragment>
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
  updateComponent?: () => void;
}

export default AccountingTabContent;
