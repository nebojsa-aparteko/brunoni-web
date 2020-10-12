import React, { Fragment } from 'react';
import Meta from '../components/Meta';
import PaymentOverviewContainer from '../components/finance/PaymentOverviewContainer';
import WeeklyPaymentFilterProvider from '../providers/WeeklyPaymentFilterProvider';

const WeeklyPaymentPage = () => {
  return (
    <Fragment>
      <Meta title="Weekly payment" />
      <WeeklyPaymentFilterProvider>
        <PaymentOverviewContainer />
      </WeeklyPaymentFilterProvider>
    </Fragment>
  );
};

export default WeeklyPaymentPage;
