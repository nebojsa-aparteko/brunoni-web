import React from 'react';
import WeeklyPayment from '../../model/WeeklyPayment';
import PaymentOverviewTable from './PaymentOverviewTable';

const PaymentOverviewContainer = () => {
  const overviewData = [] as WeeklyPayment[];

  return <PaymentOverviewTable overviewData={overviewData} />;
};

export default PaymentOverviewContainer;
