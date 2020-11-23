import React, { Fragment } from 'react';
import Meta from '../components/Meta';
import { ActivityLogProvider } from '../components/bookings/checklist/ActivityLogContext';
import CommissionOverviewContainer from '../components/finance/CommissionOverviewContainer';
import CommissionFilterProvider from '../providers/CommissionFilterProvider';

const CommissionsPage = () => {
  return (
    <Fragment>
      <Meta title="Commissions" />
      <CommissionFilterProvider>
        <ActivityLogProvider>
          <CommissionOverviewContainer />
        </ActivityLogProvider>
      </CommissionFilterProvider>
    </Fragment>
  );
};

export default CommissionsPage;
