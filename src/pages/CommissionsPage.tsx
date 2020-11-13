import React, { Fragment } from 'react';
import Meta from '../components/Meta';
import WeeklyPaymentFilterProvider from '../providers/WeeklyPaymentFilterProvider';
import { ActivityLogProvider } from '../components/bookings/checklist/ActivityLogContext';
import CommissionOverviewContainer from '../components/finance/CommissionOverviewContainer';

const CommissionsPage = () => {
  return (
    <Fragment>
      <Meta title="Commissions" />
      <WeeklyPaymentFilterProvider>
        <ActivityLogProvider>
          <CommissionOverviewContainer />
        </ActivityLogProvider>
      </WeeklyPaymentFilterProvider>
    </Fragment>
  );
};

export default CommissionsPage;
