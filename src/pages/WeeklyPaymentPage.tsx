import React, { Fragment } from 'react';
import Meta from '../components/Meta';
import PaymentOverviewContainer from '../components/finance/PaymentOverviewContainer';
import WeeklyPaymentFilterProvider from '../providers/WeeklyPaymentFilterProvider';
import { ActivityLogProvider } from '../components/bookings/checklist/ActivityLogContext';

const WeeklyPaymentPage = () => {
  return (
    <Fragment>
      <Meta title="Weekly payment" />
      <WeeklyPaymentFilterProvider>
        <ActivityLogProvider>
          <PaymentOverviewContainer />
        </ActivityLogProvider>
      </WeeklyPaymentFilterProvider>
    </Fragment>
  );
};

export default WeeklyPaymentPage;
